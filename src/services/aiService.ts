import type { AICallConfig, AIResponse, FamilyInfo, MedicalCardData } from '@/types';
import { getApiKey, getBaseUrl } from './storageService';

const DEFAULT_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_MODEL = 'gpt-3.5-turbo';

async function callAI(config: AICallConfig): Promise<AIResponse> {
  const apiKey = getApiKey();
  const baseUrl = getBaseUrl() || DEFAULT_BASE_URL;

  if (!apiKey) {
    return {
      content: '请先在设置中配置API密钥。',
    };
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content: '你是"安全小象"安全教育平台的AI助手，专门为中国家庭提供安全教育和防灾减灾建议。请用简洁易懂的中文回答。',
          },
          { role: 'user', content: config.prompt },
        ],
        temperature: config.temperature ?? 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API请求失败: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || 'AI未返回有效内容';

    let parsedJSON: Record<string, unknown> | undefined;
    if (config.expectJSON) {
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedJSON = JSON.parse(jsonMatch[0]);
        }
      } catch {
        parsedJSON = undefined;
      }
    }

    return { content, parsedJSON };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI调用失败，请检查网络和配置';
    return { content: message };
  }
}

function buildEscapeLevelPrompt(province: string, scene: string, disaster: string): string {
  return `请为${province}地区的${scene}场景生成一个${disaster}逃生关卡描述。
要求：
1. 描述该场景下${disaster}发生时的典型情况
2. 列出3-5个关键逃生决策点
3. 指出常见的逃生误区
4. 给出正确的逃生步骤建议
请用JSON格式返回，包含字段：sceneDescription, decisionPoints(数组), commonMistakes(数组), correctSteps(数组)`;
}

function buildEscapeReviewPrompt(gameStats: {
  errors: string[];
  collectedItems: string[];
  timeUsed: number;
  health: number;
}): string {
  return `请根据以下逃生游戏数据给出评价和建议：
- 犯错次数: ${gameStats.errors.length}
- 犯错内容: ${gameStats.errors.join('、') || '无'}
- 收集物品: ${gameStats.collectedItems.join('、') || '无'}
- 用时: ${gameStats.timeUsed}秒
- 剩余生命值: ${gameStats.health}

请给出：
1. 总体评价（优秀/良好/需改进）
2. 具体建议
3. 安全知识补充
请用JSON格式返回，包含字段：rating, suggestions(数组), knowledgeSupplement(字符串)`;
}

function buildQuizQuestionPrompt(knowledgePoint: string, province: string): string {
  return `请生成一道关于"${knowledgePoint}"的安全知识问答题，适用于${province}地区。
要求：
1. 题目要有实际场景感
2. 提供4个选项
3. 标明正确答案序号（0-3）
4. 给出详细解释
请用JSON格式返回，包含字段：question, options(4个选项的数组), answer(0-3的数字), explanation`;
}

function buildQuizExplanationPrompt(
  question: string,
  userAnswer: string,
  correctAnswer: string,
): string {
  return `用户回答了一道安全知识题：
题目：${question}
用户答案：${userAnswer}
正确答案：${correctAnswer}

请给出：
1. 判断用户答案是否正确
2. 解释为什么正确答案是对的
3. 补充相关安全知识
请用JSON格式返回，包含字段：isCorrect(布尔值), explanation, additionalKnowledge`;
}

function buildSuppliesListPrompt(supplyData: {
  category: string;
  disaster: string;
}): string {
  return `请为"${supplyData.disaster}"灾害推荐"${supplyData.category}"类别的应急物资清单。
要求：
1. 列出5-8种具体物资
2. 每种物资说明推荐理由
3. 标注是否为必需品
请用JSON格式返回，包含字段：items(数组，每项包含name, reason, isRequired)`;
}

function buildSuppliesPlanPrompt(familyInfo: FamilyInfo, supplies: string[]): string {
  return `请根据以下家庭信息生成应急物资储备计划：
- 家庭总人数：${familyInfo.totalPeople}
- 老人：${familyInfo.elderly}人
- 儿童：${familyInfo.children}人
- 婴儿：${familyInfo.infants}人
- 是否有慢性病患者：${familyInfo.hasChronicDisease ? '是' : '否'}
- 慢性病详情：${familyInfo.chronicDetails || '无'}
- 住房类型：${familyInfo.housingType}
- 关注灾害：${familyInfo.disasters.join('、')}
- 已有物资：${supplies.join('、') || '无'}

请给出：
1. 物资清单（含数量建议）
2. 特别注意事项
3. 储备检查清单
请用JSON格式返回，包含字段：supplyList(数组，每项含name, quantity, unit, note), specialNotes(数组), checkList(数组)`;
}

function buildEscapeGuidePrompt(pathDescription: string, homeFeatures: string): string {
  return `请根据以下信息生成家庭逃生路线规划：
家庭布局描述：${pathDescription}
房屋特征：${homeFeatures}

请给出：
1. 推荐逃生路线（至少2条）
2. 每条路线的关键节点
3. 逃生注意事项
4. 家庭成员集合点建议
请用JSON格式返回，包含字段：routes(数组，每项含name, nodes, notes), meetingPoint, generalNotes(数组)`;
}

function buildMedicalAlertPrompt(keywords: string): string {
  return `请根据以下关键词生成医疗警示信息：
关键词：${keywords}

请给出：
1. 紧急警示内容（简明扼要）
2. 紧急处理建议
3. 就医建议
请用JSON格式返回，包含字段：alertText, emergencyActions(数组), medicalAdvice`;
}

function buildMedicalRescuePrompt(medicalHistory: string): string {
  return `请根据以下病史信息生成急救参考信息：
病史：${medicalHistory}

请给出：
1. 紧急情况下需特别注意的事项
2. 用药提醒
3. 急救人员到达前的建议
请用JSON格式返回，包含字段：rescueText, specialAttention(数组), medicationReminder(数组), beforeRescueActions(数组)`;
}

export async function generateEscapeLevel(
  province: string,
  scene: string,
  disaster: string,
): Promise<AIResponse> {
  return callAI({
    prompt: buildEscapeLevelPrompt(province, scene, disaster),
    expectJSON: true,
  });
}

export async function generateEscapeReview(gameStats: {
  errors: string[];
  collectedItems: string[];
  timeUsed: number;
  health: number;
}): Promise<AIResponse> {
  return callAI({
    prompt: buildEscapeReviewPrompt(gameStats),
    expectJSON: true,
  });
}

export async function generateQuizQuestion(
  knowledgePoint: string,
  province: string,
): Promise<AIResponse> {
  return callAI({
    prompt: buildQuizQuestionPrompt(knowledgePoint, province),
    expectJSON: true,
    temperature: 0.8,
  });
}

export async function generateQuizExplanation(
  question: string,
  userAnswer: string,
  correctAnswer: string,
): Promise<AIResponse> {
  return callAI({
    prompt: buildQuizExplanationPrompt(question, userAnswer, correctAnswer),
    expectJSON: true,
  });
}

export async function generateSuppliesList(supplyData: {
  category: string;
  disaster: string;
}): Promise<AIResponse> {
  return callAI({
    prompt: buildSuppliesListPrompt(supplyData),
    expectJSON: true,
  });
}

export async function generateSuppliesPlan(
  familyInfo: FamilyInfo,
  supplies: string[],
): Promise<AIResponse> {
  return callAI({
    prompt: buildSuppliesPlanPrompt(familyInfo, supplies),
    expectJSON: true,
  });
}

export async function generateEscapeGuide(
  pathDescription: string,
  homeFeatures: string,
): Promise<AIResponse> {
  return callAI({
    prompt: buildEscapeGuidePrompt(pathDescription, homeFeatures),
    expectJSON: true,
  });
}

export async function generateMedicalAlert(keywords: string): Promise<AIResponse> {
  return callAI({
    prompt: buildMedicalAlertPrompt(keywords),
    expectJSON: true,
  });
}

export async function generateMedicalRescueText(
  medicalHistory: string,
): Promise<AIResponse> {
  return callAI({
    prompt: buildMedicalRescuePrompt(medicalHistory),
    expectJSON: true,
  });
}

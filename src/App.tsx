import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Modules from '@/pages/Modules';
import EscapeSceneSelect from '@/pages/escape/EscapeSceneSelect';
import EscapeGame from '@/pages/escape/EscapeGame';
import EscapeReport from '@/pages/escape/EscapeReport';
import Quiz from '@/pages/quiz/Quiz';
import SuppliesForm from '@/pages/supplies/SuppliesForm';
import SuppliesResult from '@/pages/supplies/SuppliesResult';
import HomePlan from '@/pages/homeplan/HomePlan';
import EscapeMap from '@/pages/homeplan/EscapeMap';
import MedicalCard from '@/pages/homeplan/MedicalCard';
import DisasterRecognition from '@/pages/DisasterRecognition';
import HomeAndSupplies from '@/pages/HomeAndSupplies';
import GamesAndEscape from '@/pages/GamesAndEscape';
import QuizAndRecognition from '@/pages/QuizAndRecognition';
import GameMain from '@/pages/games/GameMain';
import DisasterGameSelect from '@/pages/games/DisasterGameSelect';
import DisasterGame from '@/pages/games/DisasterGame';
import QuizBridgeGame from '@/pages/games/QuizBridgeGame';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route element={<Layout />}>
          <Route path="/modules" element={<Modules />} />
          <Route path="/interactive" element={<GamesAndEscape />} />
          <Route path="/learning" element={<QuizAndRecognition />} />
          <Route path="/escape" element={<EscapeSceneSelect />} />
          <Route path="/escape/game" element={<EscapeGame />} />
          <Route path="/escape/report" element={<EscapeReport />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/supplies" element={<SuppliesForm />} />
          <Route path="/supplies/result" element={<SuppliesResult />} />
          <Route path="/home-supplies" element={<HomeAndSupplies />} />
          <Route path="/home-plan" element={<HomePlan />} />
          <Route path="/home-plan/escape-map" element={<EscapeMap />} />
          <Route path="/home-plan/medical-card" element={<MedicalCard />} />
          <Route path="/disaster-recognition" element={<DisasterRecognition />} />
          <Route path="/games" element={<GameMain />} />
          <Route path="/games/escape" element={<DisasterGameSelect />} />
          <Route path="/games/quiz-bridge" element={<QuizBridgeGame />} />
          <Route path="/games/:id" element={<DisasterGame />} />
        </Route>
      </Routes>
    </Router>
  );
}

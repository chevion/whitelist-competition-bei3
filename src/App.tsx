import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import EscapeSceneSelect from '@/pages/escape/EscapeSceneSelect';
import EscapeGame from '@/pages/escape/EscapeGame';
import EscapeReport from '@/pages/escape/EscapeReport';
import Quiz from '@/pages/quiz/Quiz';
import SuppliesForm from '@/pages/supplies/SuppliesForm';
import SuppliesResult from '@/pages/supplies/SuppliesResult';
import HomePlan from '@/pages/homeplan/HomePlan';
import EscapeMap from '@/pages/homeplan/EscapeMap';
import MedicalCard from '@/pages/homeplan/MedicalCard';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/escape" element={<EscapeSceneSelect />} />
          <Route path="/escape/game" element={<EscapeGame />} />
          <Route path="/escape/report" element={<EscapeReport />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/supplies" element={<SuppliesForm />} />
          <Route path="/supplies/result" element={<SuppliesResult />} />
          <Route path="/home-plan" element={<HomePlan />} />
          <Route path="/home-plan/escape-map" element={<EscapeMap />} />
          <Route path="/home-plan/medical-card" element={<MedicalCard />} />
        </Routes>
      </Layout>
    </Router>
  );
}


import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function BaccaratEVPredictor() {
  const [history, setHistory] = useState<string[]>([]);
  const [bProb, setBProb] = useState<number | null>(null);
  const [pProb, setPProb] = useState<number | null>(null);
  const [evLog, setEvLog] = useState<number[]>([]);

  useEffect(() => {
    calculateProbabilities();
  }, [history]);

  const addResult = (result: string) => {
    const newHistory = [...history, result];
    setHistory(newHistory);
  };

  const clearHistory = () => {
    setHistory([]);
    setEvLog([]);
    setBProb(null);
    setPProb(null);
  };

  const calculateProbabilities = () => {
    if (history.length < 2) return;

    const transitions: Record<string, Record<string, number>> = {
      B: { B: 0, P: 0 },
      P: { B: 0, P: 0 }
    };

    for (let i = 0; i < history.length - 1; i++) {
      const current = history[i];
      const next = history[i + 1];
      transitions[current][next] += 1;
    }

    const last = history[history.length - 1];
    const bCount = transitions[last]?.B || 0;
    const pCount = transitions[last]?.P || 0;
    const total = bCount + pCount;

    if (total === 0) return;

    const bProbability = bCount / total;
    const pProbability = pCount / total;

    setBProb(bProbability);
    setPProb(pProbability);

    const bEV = bProbability * 0.95 - 1;
    const pEV = pProbability * 1.0 - 1;
    const chosenEV = Math.max(bEV, pEV);

    setEvLog(prev => [...prev, chosenEV]);
  };

  const getRecommendation = () => {
    if (bProb === null || pProb === null) return "資料不足";

    const bEV = bProb * 0.95 - 1;
    const pEV = pProb * 1.0 - 1;

    if (bEV > 0 && bProb > 0.55) return `建議下注【莊】，勝率 ${(bProb * 100).toFixed(2)}%，EV ${(bEV).toFixed(3)}`;
    if (pEV > 0 && pProb > 0.55) return `建議下注【閒】，勝率 ${(pProb * 100).toFixed(2)}%，EV ${(pEV).toFixed(3)}`;
    return "目前無正EV下注建議，建議觀望";
  };

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <h1 className="text-xl font-bold text-center">百家樂正EV預測系統</h1>

      <div className="flex justify-center gap-2 py-4">
        <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => addResult("B")}>莊贏</button>
        <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={() => addResult("P")}>閒贏</button>
        <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={clearHistory}>清除紀錄</button>
      </div>

      <div className="bg-white shadow rounded p-4">
        <div className="text-lg font-semibold">{getRecommendation()}</div>
      </div>

      <div className="bg-white shadow rounded p-4">
        <Line
          data={{
            labels: evLog.map((_, i) => i + 1),
            datasets: [{
              label: "每局期望值 (EV)",
              data: evLog,
              fill: false,
              borderColor: 'rgba(75,192,192,1)',
              borderWidth: 2
            }]
          }}
          options={{
            responsive: true,
            plugins: { legend: { display: true } },
            scales: {
              y: { type: 'linear', title: { display: true, text: "期望值" } },
              x: { type: 'linear', title: { display: true, text: "局數" } }
            }
          }}
        />
      </div>
    </div>
  );
}

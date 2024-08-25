import { useState, useEffect, ChangeEvent } from "react";

const App: React.FC = () => {
  const [notWanted, setNotWanted] = useState<number[]>(Array(5).fill(0));
  const [combinations, setCombinations] = useState<number[][]>(() => {
    const savedCombinations = localStorage.getItem("combinations");
    return savedCombinations ? JSON.parse(savedCombinations) : [];
  });
  const [gameResult, setGameResult] = useState<number[]>(Array(15).fill(0));
  const [prize14, setPrize14] = useState<number>(0);
  const [prize15, setPrize15] = useState<number>(0);

  const formatValue = (value: number): string => {
    return Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  useEffect(() => {
    localStorage.setItem("combinations", JSON.stringify(combinations));
  }, [combinations]);

  const handleChange = (index: number, value: string) => {
    const newNotWanted = [...notWanted];
    newNotWanted[index] = parseInt(value) || 0;
    setNotWanted(newNotWanted);
  };

  const handleResultChange = (index: number, value: string) => {
    const newGameResult = [...gameResult];
    newGameResult[index] = parseInt(value) || 0;
    setGameResult(newGameResult);
  };

  const generateCombinations = () => {
    const validNotWanted = notWanted.filter((n) => n >= 1 && n <= 25);
    if (validNotWanted.length !== 5) {
      alert("Coloque 5 números entre 1 e 25 para serem excluídos");
      return;
    }

    const allowed: number[] = [];
    for (let i = 1; i <= 25; i++) {
      if (!validNotWanted.includes(i)) {
        allowed.push(i);
      }
    }

    const finalCombinations: number[][] = [];
    for (let i = 0; i < 20; i++) {
      const temp: number[] = [];
      const copy = [...allowed];

      for (let j = 0; j < 15; j++) {
        const randIndex = Math.floor(Math.random() * (copy.length - j));
        temp.push(copy[randIndex]);
        [copy[randIndex], copy[copy.length - 1 - j]] = [
          copy[copy.length - 1 - j],
          copy[randIndex],
        ];
      }

      finalCombinations.push(temp.sort((a, b) => a - b));
    }

    setCombinations(finalCombinations);
  };

  const isCorrectNumber = (num: number): boolean => {
    return gameResult.includes(num);
  };

  const calculateHits = (combo: number[]): number => {
    return combo.filter((num) => gameResult.includes(num)).length;
  };

  const calculatePerformance = () => {
    const performance = { 11: 0, 12: 0, 13: 0, 14: 0, 15: 0 };

    combinations.forEach((combo) => {
      const hits = calculateHits(combo);
      if (hits > 10) {
        performance[hits as keyof typeof performance]++;
      }
    });

    return performance;
  };

  const calculateTotalPrizes = (performance: any) => {
    console.log(performance);
    const prizes = {
      11: 6,
      12: 12,
      13: 30,
      14: prize14,
      15: prize15,
    };

    let totalPrizes = 0;
    Object.keys(performance).forEach((key) => {
      const hits = parseInt(key);
      totalPrizes += performance[hits] * prizes[hits as keyof typeof prizes];
    });

    return totalPrizes;
  };

  const performance = calculatePerformance();
  const totalPrizes = calculateTotalPrizes(performance);
  const totalCost = 60;
  const netProfit = totalPrizes - totalCost;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Lotofácil fácil</h1>

      <div className="mb-4 flex flex-col justify-center space-x-2">
        <div>
          <h3 className="text-sm mb-4 text-center">
            Digite os números de 1 a 25 que você não deseja que entre nas
            combinações
          </h3>
        </div>
        <div className="mb-4 flex justify-center space-x-2">
          {notWanted.map((value, index) => (
            <input
              key={index}
              type="number"
              value={value === 0 ? "" : value}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleChange(index, e.target.value)
              }
              className="appearance-none w-10 h-10 text-center border border-gray-300 rounded-full"
              placeholder={`#${index + 1}`}
              min="1"
              max="25"
            />
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-bold mb-2 text-center">
          Coloque o resultado do sorteio atual
        </h2>
        <div className="flex justify-center space-x-2">
          {gameResult.map((value, index) => (
            <input
              key={index}
              type="number"
              value={value === 0 ? "" : value}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleResultChange(index, e.target.value)
              }
              className="appearance-none w-10 h-10 text-center border border-gray-300 rounded-full"
              placeholder={`#${index + 1}`}
              min="1"
              max="25"
            />
          ))}
        </div>
      </div>

      <div className="text-center mb-6">
        <button
          onClick={generateCombinations}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Gerar combinações
        </button>
      </div>

      <div className="flex justify-around">
        <div className="space-y-4">
          {combinations.map((combo, index) => (
            <div
              key={index}
              className="flex justify-center items-center space-x-2 p-4 bg-white border border-gray-200 rounded shadow"
            >
              {combo.map((num, idx) => (
                <span
                  key={idx}
                  className={`w-10 h-10 flex items-center justify-center text-white rounded-full ${
                    isCorrectNumber(num) ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {num}
                </span>
              ))}
            </div>
          ))}
        </div>
        <div className="w-1/3 p-4 bg-white border border-gray-200 rounded shadow">
          <h2 className="text-lg font-bold mb-4">Análise</h2>
          <h3 className="font-semibold mb-2">Dezenas usadas:</h3>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 25 }, (_, i) => i + 1).map((num) => (
              <span
                key={num}
                className={`w-10 h-10 flex items-center justify-center text-white rounded-full ${
                  notWanted.includes(num)
                    ? "bg-gray-300"
                    : combinations.some((combo) => combo.includes(num))
                    ? "bg-red-500"
                    : "bg-gray-200"
                }`}
              >
                {num}
              </span>
            ))}
          </div>

          <h3 className="font-semibold mt-4 mb-2">Performance:</h3>
          <table className="w-full text-center border border-gray-300">
            <thead>
              <tr>
                <th className="border px-2">Acertos</th>
                <th className="border px-2">Jogos</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(performance).map((key) => (
                <tr key={key}>
                  <td className="border px-2">{key}</td>
                  <td className="border px-2">
                    {performance[key as unknown as keyof typeof performance]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3 className="font-semibold mt-4 mb-2">Prêmios:</h3>
          <table className="w-full text-center border border-gray-300">
            <thead>
              <tr>
                <th className="border px-2">Acertos</th>
                <th className="border px-2">Prêmio</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-2">11</td>
                <td className="border px-2">R$ 6,00</td>
              </tr>
              <tr>
                <td className="border px-2">12</td>
                <td className="border px-2">R$ 12,00</td>
              </tr>
              <tr>
                <td className="border px-2">13</td>
                <td className="border px-2">R$ 30,00</td>
              </tr>
              <tr>
                <td className="border px-2">14</td>
                <td className="border px-2">
                  <input
                    type="number"
                    value={prize14 === 0 ? "" : prize14}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setPrize14(parseInt(e.target.value) || 0)
                    }
                    className="w-full text-center border-none"
                    placeholder="R$"
                  />
                </td>
              </tr>
              <tr>
                <td className="border px-2">15</td>
                <td className="border px-2">
                  <input
                    type="number"
                    value={prize15 === 0 ? "" : prize15}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setPrize15(parseInt(e.target.value) || 0)
                    }
                    className="w-full text-center border-none"
                    placeholder="R$"
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <h3 className="font-semibold mt-4 mb-2">Total da aposta:</h3>
          <div className="text-center border border-gray-300 py-2">
            R$ 60,00
          </div>

          <h3 className="font-semibold mt-4 mb-2">Total de prêmios/lucro:</h3>
          <div className="text-center border border-gray-300 py-2">
            <div>Total de prêmios: R$ {formatValue(totalPrizes)}</div>
            <div>Lucro: R$ {formatValue(netProfit)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

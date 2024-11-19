import React, { useState } from "react";
import { format } from "date-fns";
import "./App.css";

const calculateDuration = (startDate, endDate) => {
  const start = new Date(`2020-05-23T${startDate}`);
  const end = new Date(`2020-05-23T${endDate}`);
  const durationMs = end - start;
  const durationMinutes = Math.floor(durationMs / 60000);
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;
};

function App() {
  const [table1Data] = useState([
    {
      id: "1",
      startDate: "07:30:00",
      endDate: "08:30:00",
      totalHours: "01:00",
      status: "URETIM",
      stopInfo: "",
    },
    {
      id: "2",
      startDate: "08:30:00",
      endDate: "12:00:00",
      totalHours: "03:30",
      status: "URETIM",
      stopInfo: "",
    },
    {
      id: "3",
      startDate: "12:00:00",
      endDate: "13:00:00",
      totalHours: "01:00",
      status: "URETIM",
      stopInfo: "",
    },
    {
      id: "4",
      startDate: "13:00:00",
      endDate: "13:45:00",
      totalHours: "00:45",
      status: "DURUŞ",
      stopInfo: "ARIZA",
    },
    {
      id: "5",
      startDate: "13:45:00",
      endDate: "17:30:00",
      totalHours: "03:45",
      status: "URETIM",
      stopInfo: "",
    },
  ]);
  const [table2Data] = useState([
    {
      startDate_2: "10:00:00",
      endDate_2: "10:15:00",
      stopInfo_2: "Çay Molası",
    },
    {
      startDate_2: "12:00:00",
      endDate_2: "12:30:00",
      stopInfo_2: "Yemek Molası",
    },
    {
      startDate_2: "15:00:00",
      endDate_2: "15:15:00",
      stopInfo_2: "Çay Molası",
    },
  ]);
  const [combinedData, setCombinedData] = useState([]);
  const [showCombinedTable, setShowCombinedTable] = useState(false);

  const mergeData = () => {
    const allData = [
      ...table1Data.map((item) => ({
        ...item,
        type: "production",
      })),
      ...table2Data.map((item) => ({
        startDate: item.startDate_2,
        endDate: item.endDate_2,
        totalHours: calculateDuration(item.startDate_2, item.endDate_2),
        status: "DURUŞ",
        stopInfo: item.stopInfo_2,
        type: "stop",
      })),
    ];

    const combined = [];

    table1Data.forEach((item) => {
      const productionStart = new Date(`2020-05-23T${item.startDate}`);
      const productionEnd = new Date(`2020-05-23T${item.endDate}`);

      table2Data.forEach((stop) => {
        const stopStart = new Date(`2020-05-23T${stop.startDate_2}`);
        const stopEnd = new Date(`2020-05-23T${stop.endDate_2}`);

        if (productionStart < stopEnd && productionEnd > stopStart) {
          if (productionStart < stopStart) {
            combined.push({
              ...item,
              startDate: item.startDate,
              endDate: stop.startDate_2,
              totalHours: calculateDuration(item.startDate, stop.startDate_2),
              type: "production",
            });
          }

          combined.push({
            ...item,
            startDate: stop.startDate_2,
            endDate: stop.endDate_2,
            totalHours: calculateDuration(stop.startDate_2, stop.endDate_2),
            status: "DURUŞ",
            stopInfo: stop.stopInfo_2,
            type: "stop",
          });

          if (productionEnd > stopEnd) {
            combined.push({
              ...item,
              startDate: stop.endDate_2,
              endDate: item.endDate,
              totalHours: calculateDuration(stop.endDate_2, item.endDate),
              type: "production",
            });
          }
        }
      });

      if (
        combined.filter((entry) => entry.type === "production").length === 0
      ) {
        combined.push(item);
      }
    });

    table1Data.forEach((item) => {
      if (
        item.stopInfo === "ARIZA" &&
        !combined.some((entry) => entry.id === item.id)
      ) {
        combined.push(item);
      }
    });

    combined.sort((a, b) => {
      const dateA = new Date(`2020-05-23T${a.startDate}`);
      const dateB = new Date(`2020-05-23T${b.startDate}`);
      return dateA - dateB;
    });

    setCombinedData(combined);
  };

  const handleButtonClick = () => {
    mergeData();
    setShowCombinedTable(true);
  };

  return (
    <div className="min-h-screen p-8 flex flex-col items-center">
      <div className="flex justify-between items-start w-full max-w-6xl mb-8">
        <div className="bg-white shadow-lg rounded-lg p-6 w-1/2 mr-4">
          <h2 className="text-base font-semibold mb-4 text-gray-800">
            Tablo 1 →{" "}
            <span className="text-red-500">Üretim Operasyon Bildirimleri</span>
          </h2>
          <table className="w-full border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2 text-center">Kayıt No</th>
                <th className="border px-4 py-2 text-center">Başlangıç</th>
                <th className="border px-4 py-2 text-center">Bitiş</th>
                <th className="border px-4 py-2 text-center">
                  Toplam Süre (Saat)
                </th>
                <th className="border px-4 py-2 text-center">Statü</th>
                <th className="border px-4 py-2 text-center">Duruş Nedeni</th>
              </tr>
            </thead>
            <tbody>
              {table1Data.map((item, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">{item.id}</td>
                  <td className="border px-4 py-2">
                    {format(
                      new Date(`2020-05-23T${item.startDate}`),
                      "dd.MM.yyyy HH:mm:ss"
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    {format(
                      new Date(`2020-05-23T${item.endDate}`),
                      "dd.MM.yyyy HH:mm:ss"
                    )}
                  </td>
                  <td className="border px-4 py-2">{item.totalHours}</td>
                  <td className="border px-4 py-2">{item.status}</td>
                  <td className="border px-4 py-2">{item.stopInfo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 w-1/2 ml-4">
          <h2 className="text-base font-semibold mb-4 text-gray-800">
            Tablo 2 → <span className="text-yellow-500">Standart Duruşlar</span>
          </h2>
          <table className="w-full border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2 text-center">Başlangıç</th>
                <th className="border px-4 py-2 text-center">Bitiş</th>
                <th className="border px-4 py-2 text-center">Duruş Nedeni</th>
              </tr>
            </thead>
            <tbody>
              {table2Data.map((item, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">{item.startDate_2}</td>
                  <td className="border px-4 py-2">{item.endDate_2}</td>
                  <td className="border px-4 py-2">{item.stopInfo_2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <button
        onClick={handleButtonClick}
        className="mt-8 py-2 px-4 bg-blue-600 text-white rounded-lg"
      >
        Tabloyu Göster
      </button>

      {showCombinedTable && (
        <div className="mt-8 bg-white shadow-lg rounded-lg p-6 w-full max-w-6xl">
          <h2 className="text-base font-semibold mb-4 text-gray-800">
            Tablo 3 →{" "}
            <span className="text-green-500">
              Üretim Operasyon Bildirimleri
            </span>
          </h2>
          <table className="w-full border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2 text-center">Kayıt No</th>
                <th className="border px-4 py-2 text-center">Başlangıç</th>
                <th className="border px-4 py-2 text-center">Bitiş</th>
                <th className="border px-4 py-2 text-center">
                  Toplam Süre (Saat)
                </th>
                <th className="border px-4 py-2 text-center">Statü</th>
                <th className="border px-4 py-2 text-center">Duruş Nedeni</th>
              </tr>
            </thead>
            <tbody>
              {combinedData.map((item, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">{item.id}</td>
                  <td className="border px-4 py-2">
                    {format(
                      new Date(`2020-05-23T${item.startDate}`),
                      "dd.MM.yyyy HH:mm:ss"
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    {format(
                      new Date(`2020-05-23T${item.endDate}`),
                      "dd.MM.yyyy HH:mm:ss"
                    )}
                  </td>
                  <td className="border px-4 py-2">{item.totalHours}</td>
                  <td className="border px-4 py-2">{item.status}</td>
                  <td className="border px-4 py-2">{item.stopInfo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;

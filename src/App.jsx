import React, { useState } from "react";
import { format } from "date-fns";
import { tablo1 } from "./tablo1.js";
import { tablo2 } from "./tablo2.js";
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
  const [table1Data] = useState(tablo1);
  const [table2Data] = useState(tablo2);
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
    <div className="min-h-screen p-2 sm:p-6 flex flex-col items-center">
      <div className="flex flex-col sm:flex-row justify-between items-start w-full max-w-6xl mb-4">
        {/* Tablo 1 */}
        <div className="bg-white shadow-lg rounded-lg p-2 sm:p-4 w-full sm:w-1/2 mb-4 sm:mb-0 sm:mr-4">
          <h2 className="text-xs sm:text-sm font-semibold mb-2 text-gray-800">
            Tablo 1 →{" "}
            <span className="text-red-500">Üretim Operasyon Bildirimleri</span>
          </h2>
          <div className="overflow-hidden">
            <table className="w-full border border-gray-300 text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-1 sm:px-2 py-1 text-center">
                    Kayıt No
                  </th>
                  <th className="border px-1 sm:px-2 py-1 text-center">
                    Başlangıç
                  </th>
                  <th className="border px-1 sm:px-2 py-1 text-center">
                    Bitiş
                  </th>
                  <th className="border px-1 sm:px-2 py-1 text-center">
                    Toplam Süre (Saat)
                  </th>
                  <th className="border px-1 sm:px-2 py-1 text-center">
                    Statü
                  </th>
                  <th className="border px-1 sm:px-2 py-1 text-center">
                    Duruş Nedeni
                  </th>
                </tr>
              </thead>
              <tbody>
                {table1Data.map((item, index) => (
                  <tr key={index}>
                    <td className="border px-1 sm:px-2 py-1">{item.id}</td>
                    <td className="border px-1 sm:px-2 py-1">
                      {format(
                        new Date(`2020-05-23T${item.startDate}`),
                        "dd.MM.yyyy HH:mm:ss"
                      )}
                    </td>
                    <td className="border px-1 sm:px-2 py-1">
                      {format(
                        new Date(`2020-05-23T${item.endDate}`),
                        "dd.MM.yyyy HH:mm:ss"
                      )}
                    </td>
                    <td className="border px-1 sm:px-2 py-1">
                      {item.totalHours}
                    </td>
                    <td className="border px-1 sm:px-2 py-1">{item.status}</td>
                    <td className="border px-1 sm:px-2 py-1">
                      {item.stopInfo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tablo 2 */}
        <div className="bg-white shadow-lg rounded-lg p-2 sm:p-4 w-full sm:w-1/2">
          <h2 className="text-xs sm:text-sm font-semibold mb-2 text-gray-800">
            Tablo 2 → <span className="text-yellow-500">Standart Duruşlar</span>
          </h2>
          <div className="overflow-hidden">
            <table className="w-full border border-gray-300 text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-1 sm:px-2 py-1 text-center">
                    Başlangıç
                  </th>
                  <th className="border px-1 sm:px-2 py-1 text-center">
                    Bitiş
                  </th>
                  <th className="border px-1 sm:px-2 py-1 text-center">
                    Duruş Nedeni
                  </th>
                </tr>
              </thead>
              <tbody>
                {table2Data.map((item, index) => (
                  <tr key={index}>
                    <td className="border px-1 sm:px-2 py-1">
                      {item.startDate_2}
                    </td>
                    <td className="border px-1 sm:px-2 py-1">
                      {item.endDate_2}
                    </td>
                    <td className="border px-1 sm:px-2 py-1">
                      {item.stopInfo_2}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <button
        onClick={handleButtonClick}
        className="mt-4 py-2 px-4 bg-blue-600 text-white rounded-lg text-xs sm:text-sm"
      >
        Tabloları Birleştir
      </button>

      {showCombinedTable && (
        <div className="bg-white shadow-lg rounded-lg p-2 sm:p-4 mt-4 w-full max-w-6xl">
          <h2 className="text-xs sm:text-sm font-semibold mb-2 text-gray-800">
            Birleştirilmiş Tablo
          </h2>
          <div className="overflow-hidden">
            <table className="w-full border border-gray-300 text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-1 sm:px-2 py-1 text-center">
                    Kayıt No
                  </th>
                  <th className="border px-1 sm:px-2 py-1 text-center">
                    Başlangıç
                  </th>
                  <th className="border px-1 sm:px-2 py-1 text-center">
                    Bitiş
                  </th>
                  <th className="border px-1 sm:px-2 py-1 text-center">
                    Toplam Süre (Saat)
                  </th>
                  <th className="border px-1 sm:px-2 py-1 text-center">
                    Statü
                  </th>
                  <th className="border px-1 sm:px-2 py-1 text-center">
                    Duruş Nedeni
                  </th>
                </tr>
              </thead>
              <tbody>
                {combinedData.map((item, index) => (
                  <tr key={index}>
                    <td className="border px-1 sm:px-2 py-1">{item.id}</td>
                    <td className="border px-1 sm:px-2 py-1">
                      {format(
                        new Date(`2020-05-23T${item.startDate}`),
                        "dd.MM.yyyy HH:mm:ss"
                      )}
                    </td>
                    <td className="border px-1 sm:px-2 py-1">
                      {format(
                        new Date(`2020-05-23T${item.endDate}`),
                        "dd.MM.yyyy HH:mm:ss"
                      )}
                    </td>
                    <td className="border px-1 sm:px-2 py-1">
                      {item.totalHours}
                    </td>
                    <td className="border px-1 sm:px-2 py-1">{item.status}</td>
                    <td className="border px-1 sm:px-2 py-1">
                      {item.stopInfo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

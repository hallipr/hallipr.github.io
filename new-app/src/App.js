import logo from './logo.svg';
import './App.css';
import React, { useState } from 'react';

const values = await fetch('https://raw.githubusercontent.com/arkutils/Obelisk/master/data/asb/values.json').then(response => response.json());

function App() {
  const [data, setData] = useState([]);

  const handleInputChange = (index, event) => {
    const { name, value } = event.target;
    const newData = [...data];
    newData[index][name] = value;
    setData(newData);
  };

  const handleAddRow = () => {
    setData([...data, { name: '', quantity: 0, price: 0 }]);
  };

  const handleRemoveRow = (index) => {
    const newData = [...data];
    newData.splice(index, 1);
    setData(newData);
  };

  const calculateTotal = (index) => {
    const { quantity, price } = data[index];
    return quantity * price;
  };

  // select the species from values where the variant array doesn't contain "Mission", "Boss" or "Minion"
  const species = values.species.filter((item) => !item.variants || !item.variants.includes("Mission") && !item.variants.includes("Boss") && !item.variants.includes("Minion"));
   
  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Species</th>
            <th>Max Weight</th>
            <th>Quantity</th>
            <th>Age</th>
            <th>Food Type</th>
            <th>Food</th>
            <th>To Juvenile</th>
            <th>To Adult</th>
            <th>Inventory Buffer</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td>
                <select
                  name="species"
                  value={row.species}
                  onChange={(event) => handleInputChange(index, event)}
                >
                  {species.map((item, index) => (
                    <option key={index} value={item}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  type="number"
                  name="maxWeight"
                  value={row.maxWeight}
                  onChange={(event) => handleInputChange(index, event)}
                />
              </td>
              <td>
                <input
                  type="number"
                  name="quantity"
                  value={row.quantity}
                  onChange={(event) => handleInputChange(index, event)}
                />
              </td>
              <td>
                <input
                  type="number"
                  name="age"
                  value={row.age}
                  onChange={(event) => handleInputChange(index, event)}
                />
              </td>
              <td>
                {/* <select
                  name="species"
                  value={row.species}
                  onChange={(event) => handleInputChange(index, event)}
                >
                  {species.map((item) => (
                    <option key={item.name} value={item}>
                      {item.name}
                    </option>
                  ))}
                </select> */}
              </td>
              <td>
                <input
                  type="number"
                  name="food"
                  value={row.food}
                  onChange={(event) => handleInputChange(index, event)}
                />
              </td>
              <td>{calculateTotal(index)}</td>
              <td>
                <button onClick={() => handleRemoveRow(index)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleAddRow}>Add Row</button>
    </div>
  );
}


export default App;

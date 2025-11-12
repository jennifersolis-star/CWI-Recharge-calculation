import React, { useState } from 'react';

const InputForm = ({ onCalculate }) => {
  const [formData, setFormData] = useState({
    // init imput
    basinLength: 2640,
    basinWidth: 2640,
    acreage: 160, 
    soilType: 'Loam (B) | 0.7',
    landCost: 960000,
    
    // Basin design 
    leveeTopWidth: 8,
    insideSlope: 4,
    outsideSlope: 2,
    waterDepth: 1,
    freeboard: 1,

    // cast and finance
    earthworkUnitCost: 12,
    pipelineUnitCost: 20,
    pipelineLength: 5280,
    discountRate: 5, // percentage
    loanTerm: 10,
    valuePerAF: 300,
    wetYearFreq: 30, //percentage
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    
    // 
    const parsedData = {};
    for (const key in formData) {
      if (key === 'soilType') {
        parsedData[key] = formData[key].split(' | ')[0]; // Soil Name
        parsedData['infiltrationRate'] = parseFloat(formData[key].split(' | ')[1]);
      } else if (key === 'discountRate' || key === 'wetYearFreq') {
         // percentage to decimal
        parsedData[key] = parseFloat(formData[key]) / 100; 
      }
      else {
        parsedData[key] = parseFloat(formData[key]);
      }
    }

    onCalculate(parsedData); 
  };

  
  const renderInput = (label, name, value, placeholder) => (
    <div key={name}>
      <label htmlFor={name}>{label}:</label>
      <input
        type="number"
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="input-form">
      <h3>Basin Size and Soil</h3>
      {renderInput('Land Area (Acres)', 'acreage', formData.acreage, 'e.g., 160')}
      {/* Soil ype selection*/}
      <div>
        <label htmlFor="soilType">Soil Type (Infiltration Rate):</label>
        <select
          id="soilType"
          name="soilType"
          value={formData.soilType}
          onChange={handleChange}
          required
        >
          {/* */
          }
          <option value="Sand (A) | 1.0">Sand (A) - 1.0 ft/day</option>
          <option value="Loam (B) | 0.7">Loam (B) - 0.7 ft/day</option>
          <option value="Loam with A' (B) | 0.6">Loam with A' (B) - 0.6 ft/day</option>
          <option value="Loam with fine layering (B') | 0.5">Loam with fine layering (B') - 0.5 ft/day</option>
          <option value="Silt or Clay loam (C) | 0.4">Silt or Clay loam (C) - 0.4 ft/day</option>
          <option value="Clay soil (D) | 0.05">Clay soil (D) - 0.05 ft/day</option>
        </select>
      </div>

      <h3>Design & Cost Inputs</h3>
      {renderInput('Levee Top Width (ft)', 'leveeTopWidth', formData.leveeTopWidth, '8')}
      {renderInput('Inside Slope (H:1)', 'insideSlope', formData.insideSlope, '4')}
      {renderInput('Outside Slope (H:1)', 'outsideSlope', formData.outsideSlope, '2')}
      {renderInput('Water Depth (ft)', 'waterDepth', formData.waterDepth, '1')}
      {renderInput('Freeboard (ft)', 'freeboard', formData.freeboard, '1')}
      
      {renderInput('Land Purchase Cost ($)', 'landCost', formData.landCost, '960000')}
      {renderInput('Earthwork Unit Cost ($/yd³)', 'earthworkUnitCost', formData.earthworkUnitCost, '12')}
      {renderInput('Pipeline Length (ft)', 'pipelineLength', formData.pipelineLength, '5280')}
      {renderInput('Pipeline Unit Cost ($/ft)', 'pipelineUnitCost', formData.pipelineUnitCost, '20')}


      <button type="submit">Calculate ROI</button>
    </form>
  );
};

export default InputForm;
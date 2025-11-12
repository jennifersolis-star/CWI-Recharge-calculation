import React, { useState } from 'react';
import InputForm from './InputForm';

// constants based
const MONTHS_WET_SEASON = 4;
const DAYS_PER_MONTH = 30;
const DAYS_WET_SEASON = MONTHS_WET_SEASON * DAYS_PER_MONTH; // 120 days
const SQFT_PER_ACRE = 43560;
const CUFT_PER_CUYD = 27;
const O_AND_M_PERCENTAGE = 0.05; 
const CONTINGENCY_PERCENTAGE = 0.20;
const ACRES_PER_SQ_MILE = 640;

// Helper function
const formatCurrency = (amount) => {
  if (isNaN(amount) || amount === null) return 'N/A';
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const calculateAllMetrics = (data) => {
  const {
    basinLength, basinWidth, acreage, infiltrationRate, landCost,
    leveeTopWidth, insideSlope, outsideSlope, waterDepth, freeboard,
    earthworkUnitCost, pipelineUnitCost, pipelineLength, discountRate,
    loanTerm, valuePerAF, wetYearFreq,
  } = data;
  
  //
  const leveeHeight = waterDepth + freeboard; 
  
  // outer Dimension
  const outerDimension = basinLength; 
  const outerPerimeter = 4 * outerDimension;

 
  const insidePerimeter = outerPerimeter - 4 * leveeTopWidth;

  //
  const distanceAcrossLevee = leveeTopWidth + (insideSlope * leveeHeight) + (outsideSlope * leveeHeight);
  const insideLeveeLength = outerDimension - 2 * distanceAcrossLevee; 
  const innerLeveeLength = outerDimension - 2 * leveeTopWidth - 2 * (insideSlope * leveeHeight) - 2 * (outsideSlope * leveeHeight);
  const insideLeveeDimension = 2608;
  const insideLeveeArea = insideLeveeDimension * insideLeveeDimension; 
  const wettedAreaSF = insideLeveeArea; // Wet area 
  const wettedAreaAcres = wettedAreaSF / SQFT_PER_ACRE; 

  // Cross-sectional 
  const crossSectionArea = leveeHeight * (leveeTopWidth + (leveeHeight / 2) * (insideSlope + outsideSlope));
  
  const earthworkVolumeCUFT = crossSectionArea * outerPerimeter;
  const earthworkVolumeCUYD = earthworkVolumeCUFT / CUFT_PER_CUYD; 

  // TOTAL COST
  const earthworkCost = earthworkVolumeCUYD * earthworkUnitCost; 
  const pipelineCost = pipelineLength * pipelineUnitCost; 
  const subtotal = landCost + earthworkCost + pipelineCost; 
  const contingencyCost = subtotal * CONTINGENCY_PERCENTAGE; 
  const totalCostEstimate = subtotal + contingencyCost; 


  // Total Potential Recharge (AF) = Wetted Area (Acres) * Infiltration Rate (ft/day) * Days Wet Season
  const totalPotentialRechargeAF = wettedAreaAcres * infiltrationRate * DAYS_WET_SEASON;
  // Annual Average Recharge (AF) = Total Potential Recharge * Wet Year Frequency
  const annualAverageRechargeAF = totalPotentialRechargeAF * wetYearFreq; 

  // Annual Benefit = Average Recharge * Value per AF
  const annualBenefit = annualAverageRechargeAF * valuePerAF;
  
  // Annual oandm 
  const annualOMCost = annualBenefit * O_AND_M_PERCENTAGE; 

  // Net anu flow
  const annualNetBenefit = annualBenefit - annualOMCost; 

  let cumulativeNPV = 0;
  let cashFlows = [];
  const initialCost = -totalCostEstimate;

  // Year 0 
  cumulativeNPV += initialCost;
  cashFlows.push({ year: 0, cost: initialCost, benefit: 0, netBenefit: initialCost, npv: cumulativeNPV });

  // Years 1 
  for (let year = 1; year <= loanTerm; year++) {
    // Discount for year 
    const discountFactor = 1 / Math.pow(1 + discountRate, year);
    
    // Annual Net Cash Flow
    const netCashFlow = annualNetBenefit; 

    // Cash Flow 
    const discountedCashFlow = netCashFlow * discountFactor;

    cumulativeNPV += discountedCashFlow;

    cashFlows.push({
      year: year,
      cost: 0, // Costs 
      benefit: annualBenefit,
      netBenefit: annualNetBenefit,
      discountedNetBenefit: discountedCashFlow,
      npv: cumulativeNPV,
    });
  }
  
  // Calculate final ROI
  // Total Net Benefit = Annual Net Benefit * Loan Term
  const totalNetBenefitUndiscounted = annualNetBenefit * loanTerm;
  const simpleROIRatio = (totalNetBenefitUndiscounted / totalCostEstimate);
  const ROI = (cumulativeNPV / totalCostEstimate) * 100; // use NPV/Cost
  

  return {
    // Geometry & Earthwork
    wettedAreaAcres: wettedAreaAcres,
    earthworkVolumeCUYD: earthworkVolumeCUYD,
    
    // Costs
    subtotal: subtotal,
    contingencyCost: contingencyCost,
    totalCostEstimate: totalCostEstimate,
    
    // Benefits
    annualAverageRechargeAF: annualAverageRechargeAF,
    annualBenefit: annualBenefit,
    annualOMCost: annualOMCost,
    annualNetBenefit: annualNetBenefit,
    
    // Financials
    cashFlows: cashFlows,
    npv: cumulativeNPV,
    roi: ROI,
  };
};

const RechargeCalculator = () => {
  const [results, setResults] = useState(null);

  const handleCalculate = (data) => {
    // calculation
    const calculatedResults = calculateAllMetrics(data);
    setResults(calculatedResults);
    console.log("Full Calculated Results:", calculatedResults);
  };

  //result shown
  return (
    <>
      <section id="find-roi">
        <h2>Find Your ROI (Return on Investment)</h2>
        <InputForm onCalculate={handleCalculate} />
      </section>

      <section id="results">
        <h2>Results & Summary</h2>
        {results ? (
          <div className="calculation-results">
            <h3>Total Project Cost</h3>
            <p>Earthwork Volume: {results.earthworkVolumeCUYD.toLocaleString('en-US', { maximumFractionDigits: 0 })} yd³</p>
            <p>Subtotal (Land + Earthwork + Pipeline): {formatCurrency(results.subtotal)}</p>
            <p>Contingency (20%): {formatCurrency(results.contingencyCost)}</p>
            <h4>Total Cost Estimate: **{formatCurrency(results.totalCostEstimate)}**</h4>
            
            <hr/>

            <h3>Annual Water Recharge and Benefit</h3>
            <p>Wetted Area: {results.wettedAreaAcres.toLocaleString('en-US', { maximumFractionDigits: 1 })} acres</p>
            <p>Annual Avg. Recharge: {results.annualAverageRechargeAF.toLocaleString('en-US', { maximumFractionDigits: 0 })} AF</p>
            <p>Gross Annual Benefit: {formatCurrency(results.annualBenefit)}</p>
            <p>Annual O&M Cost (5%): {formatCurrency(results.annualOMCost)}</p>
            <h4>Net Annual Benefit: **{formatCurrency(results.annualNetBenefit)}**</h4>

            <hr/>

            <h3>Return on Investment</h3>
            <p>Net Present Value (NPV) over 10 Years: **{formatCurrency(results.npv)}**</p>
            <p>ROI (Based on NPV/Total Cost): **{results.roi.toLocaleString('en-US', { maximumFractionDigits: 2 })}%**</p>
            
            <hr/>

            {}
            <h4>Cash Flow Summary (10-Year Loan Term)</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: 'left' }}>Year</th>
                        <th>Net Benefit</th>
                        <th>Discounted Net Benefit</th>
                        <th>Cumulative NPV</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={{ textAlign: 'left' }}>0</td>
                        <td>Initial Investment</td>
                        <td>-</td>
                        <td>{formatCurrency(results.cashFlows[0].npv)}</td>
                    </tr>
                    {results.cashFlows.slice(1).map((flow) => (
                        <tr key={flow.year}>
                            <td style={{ textAlign: 'left' }}>{flow.year}</td>
                            <td>{formatCurrency(flow.netBenefit)}</td>
                            <td>{formatCurrency(flow.discountedNetBenefit)}</td>
                            <td>{formatCurrency(flow.npv)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

          </div>
        ) : (
          <p>Enter all project details and click 'Calculate ROI' to see the comprehensive feasibility results.</p>
        )}
      </section>
    </>
  );
};

export default RechargeCalculator;
import fs from 'fs';
import path from 'path';

const file = '/Users/sridhars/.gemini/antigravity/scratch/sss-agency/src/components/AdminViews.tsx';
let content = fs.readFileSync(file, 'utf8');

// The `renderDelivery` method starts at `const renderDelivery = () => {`
// Let's replace the top calculations. 
content = content.replace(
  /const totalMileage = mileageReports\.reduce\(\(s, r\) => s \+ \(r\.endOdo - r\.startOdo\), 0\);/,
  'const totalMileage = todayMileageReports.reduce((s, r) => s + (r.endOdo - r.startOdo), 0);'
);
content = content.replace(
  /const totalCash = marketCollections\.filter\(\(c\) => c\.type === 'Cash'\)\.reduce\(\(s, c\) => s \+ c\.amount, 0\);/,
  "const totalCash = todayMarketCollections.filter((c) => c.type === 'Cash').reduce((s, c) => s + c.amount, 0);"
);
content = content.replace(
  /const totalIMPS = marketCollections\.filter\(\(c\) => c\.type === 'IMPS'\)\.reduce\(\(s, c\) => s \+ c\.amount, 0\);/,
  "const totalIMPS = todayMarketCollections.filter((c) => c.type === 'IMPS').reduce((s, c) => s + c.amount, 0);"
);
content = content.replace(
  /const totalCheque = marketCollections\.filter\(\(c\) => c\.type === 'Cheque'\)\.reduce\(\(s, c\) => s \+ c\.amount, 0\);/,
  "const totalCheque = todayMarketCollections.filter((c) => c.type === 'Cheque').reduce((s, c) => s + c.amount, 0);"
);

// Define unifiedReturns merging driver returns and salesman damage reports.
// Map them to look like the unified object.
const unifiedReturnsCode = `
    const unifiedReturns = [
      ...todayReturnReports.map(r => ({ ...r, _sourceType: 'Driver', _name: r.driverName })),
      ...todayDamageReports.map(r => ({ ...r, _sourceType: 'Salesman', _name: r.salesmanName }))
    ];

    const filteredReturns = unifiedReturns.filter(r => {
      const q = returnsSearch.toLowerCase();
      // Use existing getReturnDisplayName for both, since both have items[] or productName
      const displayName = getReturnDisplayName(r as any);
      return r.shopName.toLowerCase().includes(q) || displayName.toLowerCase().includes(q);
    });
`;

content = content.replace(
  /const filteredReturns = returnReports\.filter\(r => \{[\s\S]*?\}\);/,
  unifiedReturnsCode
);

// We need to also update the render loop to show the source tag.
// We find: <td className="py-3">
//          <p className="font-bold text-neutral-900">{ret.shopName}</p>
//          <span className="text-[10px] text-neutral-400 font-mono-sm">{ret.shopNo}</span>
//        </td>

const targetTd = `<td className="py-3">
                          <p className="font-bold text-neutral-900">{ret.shopName}</p>
                          <span className="text-[10px] text-neutral-400 font-mono-sm">{ret.shopNo}</span>
                        </td>`;
                        
const newTd = `<td className="py-3">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-neutral-900">{ret.shopName}</p>
                            {(ret as any)._sourceType === 'Salesman' ? (
                              <span className="text-[9px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Sales Damage</span>
                            ) : (
                              <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Driver Return</span>
                            )}
                          </div>
                          <span className="text-[10px] text-neutral-400 font-mono-sm">{ret.shopNo}</span>
                        </td>`;

content = content.replace(targetTd, newTd);

fs.writeFileSync(file, content);
console.log('Successfully updated delivery views.');

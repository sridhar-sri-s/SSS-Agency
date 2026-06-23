import fs from 'fs';
import path from 'path';

const file = '/Users/sridhars/.gemini/antigravity/scratch/sss-agency/src/components/AdminViews.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. UPDATE renderOverview
content = content.replace(
  /const totalSalesSum = salesReports\.reduce\(\(s, r\) => s \+ r\.totalSales, 0\);/,
  'const totalSalesSum = todaySalesReports.reduce((s, r) => s + r.totalSales, 0);'
);
content = content.replace(
  /const activePackers = packingLogs\.filter\(\(p\) => p\.status === 'Packing'\)\.length;/,
  "const activePackers = todayPackingLogs.filter((p) => p.status === 'Packing').length;"
);
content = content.replace(
  /const packingEff = Math\.round\(packingLogs\.reduce\(\(s, l\) => s \+ l\.efficiency, 0\) \/ \(packingLogs\.length \|\| 1\)\);/,
  'const packingEff = Math.round(todayPackingLogs.reduce((s, l) => s + l.efficiency, 0) / (todayPackingLogs.length || 1));'
);
content = content.replace(
  /\{salesReports\.length\}-record sales beats, \{packingLogs\.length\} packing stations/,
  '{todaySalesReports.length}-record sales beats, {todayPackingLogs.length} packing stations'
);

// 2. UPDATE renderSales
content = content.replace(
  /const todaySales = salesReports\.filter\(r => r\.date === new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\]\);/g,
  'const todaySales = todaySalesReports;'
);
// In renderSales, change `const totalSalesSum = salesReports.reduce` to `todaySalesReports`? 
// No, renderSales already computes `todaySales`.

// 3. ADD Date Picker at top
const datePickerHTML = `
      {/* Global Date Filter for Dashboards */}
      <div className="bg-white px-6 py-4 border-b border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-neutral-800 text-sm">Dashboard Date Context</h2>
          <p className="text-[11px] text-neutral-500">Live metrics reflect this date. Verification hub shows all history.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-neutral-600">Select Date:</label>
          <input 
            type="date" 
            value={dashboardDate}
            onChange={(e) => setDashboardDate(e.target.value)}
            className="px-3 py-1.5 bg-neutral-100 border border-neutral-200 rounded-lg text-xs font-mono-sm font-semibold outline-none focus:border-[#0071E3]"
          />
          <button 
            onClick={() => setDashboardDate(new Date().toISOString().split('T')[0])}
            className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors"
          >
            Today
          </button>
        </div>
      </div>
`;
content = content.replace(
  /<div className="flex-1 bg-\[\#F5F5F7\] overflow-y-auto overflow-x-hidden">/,
  '<div className="flex-1 bg-[#F5F5F7] overflow-y-auto overflow-x-hidden">\n' + datePickerHTML
);

fs.writeFileSync(file, content);
console.log('Successfully updated overview and global layout.');

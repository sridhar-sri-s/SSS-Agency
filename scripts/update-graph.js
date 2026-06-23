import fs from 'fs';
import path from 'path';

const file = '/Users/sridhars/.gemini/antigravity/scratch/sss-agency/src/components/AdminViews.tsx';
let content = fs.readFileSync(file, 'utf8');

// Find the start of renderSales
const renderSalesStart = '  const renderSales = () => {';
const index = content.indexOf(renderSalesStart);

if (index === -1) {
  console.error("Could not find renderSales");
  process.exit(1);
}

// Generate the dynamic graph code
const dynamicGraphLogic = `
    // Dynamic Graph Logic
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(dashboardDate);
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const salesByDay = last7Days.map(date => {
      return salesReports
        .filter(r => r.date === date)
        .reduce((sum, r) => sum + r.totalSales, 0);
    });

    const maxGraphSales = Math.max(...salesByDay, 1000);
    
    // SVG uses 100x30 coordinate system
    const points = salesByDay.map((sales, i) => {
      const x = (i / 6) * 100;
      const y = 28 - ((sales / maxGraphSales) * 24); // range from 4 to 28
      return { x, y, sales, date: last7Days[i] };
    });

    // Create SVG paths
    const pathD = \`M 0,30 \` + points.map(p => \`L \${p.x},\${p.y}\`).join(' ') + \` L 100,30 Z\`;
    const lineD = \`M \${points[0].x},\${points[0].y} \` + points.slice(1).map(p => \`L \${p.x},\${p.y}\`).join(' ');

    const formatShortDate = (dateStr: string) => {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
`;

content = content.slice(0, index + renderSalesStart.length) + dynamicGraphLogic + content.slice(index + renderSalesStart.length);

// Now replace the hardcoded graph JSX
const hardcodedGraph = `            {/* Custom SVG line chart matching Google's vector styling */}
            <div className="h-48 w-full border border-neutral-100 rounded-xl bg-neutral-50/50 p-2 flex flex-col justify-between relative overflow-hidden">
              <svg className="w-full h-32 overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="sales-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25"/>
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0.00"/>
                  </linearGradient>
                </defs>
                {/* Gridlines */}
                <line x1="0" y1="5" x2="100" y2="5" stroke="#E5E5E5" strokeWidth="0.1" />
                <line x1="0" y1="15" x2="100" y2="15" stroke="#E5E5E5" strokeWidth="0.1" />
                <line x1="0" y1="25" x2="100" y2="25" stroke="#E5E5E5" strokeWidth="0.1" />
                
                {/* SVG Area */}
                <path d="M 0,28 L 5,22 Q 15,12 25,18 T 45,8 T 65,15 T 85,6 T 100,10 L 100,30 L 0,30 Z" fill="url(#sales-gradient)" />
                {/* SVG Line */}
                <path d="M 0,28 Q 10,20 20,15 T 40,10 T 60,18 T 80,4 T 100,10" fill="none" stroke="#2563eb" strokeWidth="0.8" strokeLinecap="round" />
                
                {/* Interactivity indicators */}
                <circle cx="40" cy="10" r="1.5" fill="#2563eb" className="animate-pulse" />
                <circle cx="80" cy="4" r="1.5" fill="#10B981" />
              </svg>

              {/* Chart labels */}
              <div className="flex justify-between text-[10px] text-neutral-400 font-mono-sm px-2 pt-1 border-t border-neutral-100">
                <span>Oct 21</span>
                <span>Oct 22</span>
                <span>Oct 23</span>
                <span>Oct 24</span>
                <span>Oct 25</span>
                <span>Oct 26</span>
                <span>Oct 27 (Today)</span>
              </div>
            </div>`;

const dynamicGraphJSX = `            {/* Dynamic SVG line chart */}
            <div className="h-48 w-full border border-neutral-100 rounded-xl bg-neutral-50/50 p-2 flex flex-col justify-between relative overflow-hidden group">
              <svg className="w-full h-32 overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="sales-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.35"/>
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0.00"/>
                  </linearGradient>
                </defs>
                {/* Gridlines */}
                <line x1="0" y1="4" x2="100" y2="4" stroke="#E5E5E5" strokeWidth="0.1" />
                <line x1="0" y1="16" x2="100" y2="16" stroke="#E5E5E5" strokeWidth="0.1" />
                <line x1="0" y1="28" x2="100" y2="28" stroke="#E5E5E5" strokeWidth="0.1" />
                
                {/* SVG Area */}
                <path d={pathD} fill="url(#sales-gradient)" className="transition-all duration-500 ease-in-out" />
                {/* SVG Line */}
                <path d={lineD} fill="none" stroke="#2563eb" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-500 ease-in-out" />
                
                {/* Data Points */}
                {points.map((p, i) => (
                  <circle 
                    key={i} 
                    cx={p.x} 
                    cy={p.y} 
                    r="1.2" 
                    fill={i === 6 ? '#10B981' : '#2563eb'} 
                    className="transition-all duration-500 ease-in-out hover:r-[2]"
                  >
                    <title>{formatShortDate(p.date)}: ₹{p.sales.toLocaleString()}</title>
                  </circle>
                ))}
              </svg>

              {/* Chart labels */}
              <div className="flex justify-between text-[9px] sm:text-[10px] text-neutral-400 font-mono-sm px-1 sm:px-2 pt-1 border-t border-neutral-100">
                {points.map((p, i) => (
                  <span key={i} className={i === 6 ? 'font-bold text-[#10B981]' : ''}>
                    {i === 6 ? 'Today' : formatShortDate(p.date)}
                  </span>
                ))}
              </div>
            </div>`;

content = content.replace(hardcodedGraph, dynamicGraphJSX);

fs.writeFileSync(file, content);
console.log('Successfully updated sales graph.');

import fs from 'fs';
import path from 'path';

const file = '/Users/sridhars/.gemini/antigravity/scratch/sss-agency/src/components/AdminViews.tsx';
let content = fs.readFileSync(file, 'utf8');

// The `renderPacking` method starts at `const renderPacking = () => {`
// Let's replace the whole method body. 
const startTag = '  const renderPacking = () => {';
const endTag = '  // TAB 4: DELIVERY & RETURNS';

const startIndex = content.indexOf(startTag);
const endIndex = content.indexOf(endTag);

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find start or end tags for renderPacking");
  process.exit(1);
}

const newRenderPacking = `  const renderPacking = () => {
    // === DAILY MATH ===
    const totalPacked = todayPackingLogs.reduce((s, p) => s + p.productsPacked, 0);
    const completionPercent = dailyTarget > 0 ? Math.min(100, Math.round((totalPacked / dailyTarget) * 100)) : 0;

    // Daily Leaderboard sorting
    const dailyPackerStats = [...usersList.filter(u => u.role === 'Packing' && u.name.toLowerCase().includes(packingSearch.toLowerCase()))].map(packer => {
      const log = todayPackingLogs.find(l => l.memberId === packer.id);
      return {
        ...packer,
        log,
        productsPacked: log ? log.productsPacked : 0,
        efficiency: log ? log.efficiency : 0,
        status: log ? log.status : 'Offline'
      };
    }).sort((a, b) => b.productsPacked - a.productsPacked);

    // === MONTHLY MATH ===
    const monthlyLogs = packingLogs.filter(log => {
      if (!log.date) return false;
      return log.date.startsWith(selectedMonth);
    });

    const memberMonthlyMap = new Map<string, { logs: any[]; name: string; station: string }>();
    monthlyLogs.forEach(log => {
      const existing = memberMonthlyMap.get(log.memberId);
      if (existing) {
        existing.logs.push(log);
      } else {
        const packer = usersList.find(u => u.id === log.memberId);
        const stationStr = packer?.detail || \`Station \${log.station}\`;
        memberMonthlyMap.set(log.memberId, { logs: [log], name: log.memberName, station: stationStr });
      }
    });

    // Month sorted by total Packed (Leaderboard requirement)
    const monthlyPackerStats = Array.from(memberMonthlyMap.entries()).map(([memberId, data]) => {
      const totalPacked = data.logs.reduce((s, l) => s + l.productsPacked, 0);
      const avgEfficiency = Math.round(data.logs.reduce((s, l) => s + l.efficiency, 0) / (data.logs.length || 1));
      const daysWorked = new Set(data.logs.map(l => l.date)).size;
      return {
        memberId,
        name: data.name,
        station: data.station,
        totalPacked,
        avgEfficiency,
        daysWorked,
      };
    }).sort((a, b) => b.totalPacked - a.totalPacked);

    const monthlyTeamOutput = monthlyPackerStats.reduce((s, p) => s + p.totalPacked, 0);
    const bestPerformer = monthlyPackerStats.length > 0 ? monthlyPackerStats[0] : null;
    const avgTeamEfficiency = monthlyPackerStats.length > 0
      ? Math.round(monthlyPackerStats.reduce((s, p) => s + p.avgEfficiency, 0) / monthlyPackerStats.length)
      : 0;
    const totalWorkDays = monthlyPackerStats.reduce((s, p) => s + p.daysWorked, 0);
    const selectedMonthLabel = monthOptions.find(o => o.value === selectedMonth)?.label || selectedMonth;

    return (
      <div id="packing-view" className="space-y-6">
        
        {/* Packing line productivity bar & Target Settings */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Corporate Fulfillment Target</span>
              <h2 className="text-xl font-bold text-neutral-900 mt-1">Daily Company Target</h2>
            </div>
            {isAdmin && (
              <div className="flex gap-4">
                <div className="bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase block mb-0.5">Daily Goal</span>
                  <input 
                    type="number" 
                    value={dailyTarget} 
                    onChange={e => saveDailyTarget(Number(e.target.value))}
                    className="w-20 bg-transparent text-sm font-bold font-mono-sm outline-none text-indigo-700" 
                  />
                </div>
                <div className="bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase block mb-0.5">Monthly per Packer Goal</span>
                  <input 
                    type="number" 
                    value={monthlyTarget} 
                    onChange={e => saveMonthlyTarget(Number(e.target.value))}
                    className="w-20 bg-transparent text-sm font-bold font-mono-sm outline-none text-indigo-700" 
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <p className="text-sm font-bold text-indigo-600 font-mono-sm">
              {totalPacked.toLocaleString()} / {dailyTarget.toLocaleString()} units ({completionPercent}% completed)
            </p>
          </div>

          <div className="w-full bg-neutral-100 h-4 rounded-full overflow-hidden border border-neutral-200">
            <div 
              className="bg-indigo-600 h-4 rounded-full transition-all duration-700 animate-pulse" 
              style={{ width: \`\${completionPercent}%\` }} 
            />
          </div>
        </div>

        {/* Daily Leaderboard & Stations */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-neutral-800 text-sm">🏆 Daily Leaderboard & Stations</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={12} />
              <input 
                type="text" 
                placeholder="Find station operator..."
                value={packingSearch}
                onChange={(e) => setPackingSearch(e.target.value)}
                className="pl-8 pr-3 py-1 border border-neutral-200 rounded-lg text-xs outline-none focus:border-indigo-500 shadow-sm" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dailyPackerStats.map((packer, idx) => {
              const isOnBreak = packer.status === 'On Break';
              const isCheckedOut = packer.status === 'Checked Out';
              const isPacking = packer.status === 'Packing';
              const stationStr = packer.detail || \`Station \${packer.id.replace(/\\D/g, '')}\`;

              return (
                <div key={packer.id} className={\`bg-white p-4 rounded-xl border \${idx < 3 ? 'border-amber-300 shadow-md bg-gradient-to-b from-[#FFFDF0] to-white' : 'border-neutral-200 shadow-sm'} flex flex-col justify-between space-y-3 relative overflow-hidden\`}>
                  {idx === 0 && <div className="absolute top-0 right-0 bg-amber-400 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-bl-lg">🥇 1st Place</div>}
                  {idx === 1 && <div className="absolute top-0 right-0 bg-slate-300 text-slate-800 text-[10px] font-black px-2 py-0.5 rounded-bl-lg">🥈 2nd Place</div>}
                  {idx === 2 && <div className="absolute top-0 right-0 bg-orange-300 text-orange-900 text-[10px] font-black px-2 py-0.5 rounded-bl-lg">🥉 3rd Place</div>}

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-neutral-400">{stationStr}</span>
                    <span className={\`text-[10px] font-semibold px-2 py-0.5 rounded-full \${
                      isOnBreak ? 'bg-amber-100 text-amber-800 border border-amber-200' : 
                      isCheckedOut ? 'bg-neutral-100 text-neutral-500 border border-neutral-200' : 
                      isPacking ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 
                      'bg-red-50 text-red-700 border border-red-150'
                    }\`}>
                      {packer.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-neutral-900 text-sm">{packer.name}</h4>
                    <p className="text-xl font-extrabold text-neutral-900 tracking-tight font-mono-sm mt-1">
                      {packer.productsPacked.toLocaleString()}{' '}
                      <span className="text-xs text-neutral-400 font-medium font-sans">products</span>
                    </p>
                  </div>

                  <div className="border-t border-neutral-100 pt-2 flex items-center justify-between text-[11px] text-neutral-500 font-mono-sm">
                    <span>Performance Coefficient:</span>
                    <span className={\`font-bold \${packer.efficiency >= 90 ? 'text-emerald-600' : packer.efficiency >= 80 ? 'text-indigo-600' : 'text-neutral-500'}\`}>
                      {packer.efficiency}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ============================================ */}
        {/* MONTHLY PACKING PROGRESS & LEADERBOARD       */}
        {/* ============================================ */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-neutral-800 text-base">🏆 Monthly Packer Leaderboard</h3>
              <p className="text-[11px] text-neutral-500">Ranked by total volume processed</p>
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0071E3]" size={14} />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="pl-8 pr-8 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-bold text-neutral-700 appearance-none outline-none focus:border-[#0071E3] shadow-sm cursor-pointer"
              >
                {monthOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={14} />
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-150">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Total Output</span>
              <p className="text-xl font-black font-mono-sm text-neutral-900 mt-1">{monthlyTeamOutput.toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-150">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Monthly MVP</span>
              <p className="text-xl font-black text-[#0071E3] mt-1 flex items-center gap-2">
                {bestPerformer ? bestPerformer.name : 'N/A'} {bestPerformer && '👑'}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-150">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Average Efficiency</span>
              <p className="text-xl font-black font-mono-sm text-neutral-900 mt-1">{avgTeamEfficiency}%</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-150">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Total Shifts Logged</span>
              <p className="text-xl font-black font-mono-sm text-neutral-900 mt-1">{totalWorkDays}</p>
            </div>
          </div>

          {monthlyPackerStats.length === 0 ? (
            <div className="bg-neutral-50 border border-neutral-200 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center">
              <Package size={32} className="text-neutral-300 mb-3" />
              <p className="font-semibold text-neutral-600">No packing data for {selectedMonthLabel}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {monthlyPackerStats.map((packer, idx) => {
                const progressPercent = monthlyTarget > 0 ? Math.min(100, Math.round((packer.totalPacked / monthlyTarget) * 100)) : 0;
                
                // Color coding based on progress to target
                let barColor = 'bg-neutral-400';
                let effBg = 'bg-neutral-100';
                let effColor = 'text-neutral-600';
                let dotColor = 'bg-neutral-300';

                if (progressPercent >= 100) {
                  barColor = 'bg-emerald-500';
                  effBg = 'bg-emerald-50';
                  effColor = 'text-emerald-700';
                  dotColor = 'bg-emerald-500';
                } else if (progressPercent >= 75) {
                  barColor = 'bg-[#0071E3]';
                  effBg = 'bg-blue-50';
                  effColor = 'text-[#0071E3]';
                  dotColor = 'bg-[#0071E3]';
                } else if (progressPercent >= 50) {
                  barColor = 'bg-amber-500';
                  effBg = 'bg-amber-50';
                  effColor = 'text-amber-700';
                  dotColor = 'bg-amber-500';
                } else {
                  barColor = 'bg-rose-500';
                  effBg = 'bg-rose-50';
                  effColor = 'text-rose-700';
                  dotColor = 'bg-rose-500';
                }

                return (
                  <div key={packer.memberId} className={\`bg-white p-4 rounded-xl border shadow-sm flex flex-col gap-3 \${idx < 3 ? 'border-[#0071E3]/30' : 'border-neutral-200'}\`}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className={\`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs \${idx === 0 ? 'bg-amber-400 text-white shadow-md' : idx === 1 ? 'bg-slate-300 text-white shadow-md' : idx === 2 ? 'bg-orange-300 text-white shadow-md' : 'bg-neutral-100 text-neutral-500'}\`}>
                          #{idx + 1}
                        </div>
                        <div>
                          <h4 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
                            {packer.name} 
                            {idx === 0 && <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">Top Packer</span>}
                          </h4>
                          <span className="text-[10px] text-neutral-400 uppercase font-bold">{packer.station}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-[10px] text-neutral-500 uppercase font-bold block mb-0.5">Average Eff.</span>
                        <span className={\`text-[10px] font-bold px-2.5 py-1 rounded-full border \${effBg} \${effColor}\`}>
                          {packer.avgEfficiency}%
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-end mt-2">
                      <div>
                        <span className="text-[10px] text-neutral-500 uppercase font-bold block mb-0.5">Monthly Total</span>
                        <p className={\`text-lg font-extrabold font-mono-sm \${effColor}\`}>{packer.totalPacked.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-neutral-500 font-mono-sm">
                          {progressPercent}% of target
                        </p>
                      </div>
                    </div>

                    <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden mt-1">
                      <div 
                        className={\`\${barColor} h-2 rounded-full transition-all duration-700\`}
                        style={{ width: \`\${progressPercent}%\` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

`;

content = content.substring(0, startIndex) + newRenderPacking + content.substring(endIndex);

fs.writeFileSync(file, content);
console.log('Successfully updated packing views.');

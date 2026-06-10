var Eu=Object.defineProperty;var Tu=(i,e,t)=>e in i?Eu(i,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):i[e]=t;var xe=(i,e,t)=>Tu(i,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function t(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(s){if(s.ep)return;s.ep=!0;const r=t(s);fetch(s.href,r)}})();function wu(){return new Cu}const Au={heat:{chord:[55,110,165,220],scale:[330,370,440,495,587],filterBase:320,filterSweep:180,noteIntervalMs:2600,pulse:!0,padGain:.05},rain:{chord:[73.4,110,146.8,220],scale:[293.7,349.2,392,440,523.3],filterBase:560,filterSweep:260,noteIntervalMs:1900,pulse:!1,padGain:.055},air:{chord:[65.4,98,130.8,196],scale:[261.6,294,392,440,588],filterBase:300,filterSweep:120,noteIntervalMs:3e3,pulse:!1,padGain:.05},energy:{chord:[82.4,123.5,164.8,247],scale:[329.6,412,494,659,824],filterBase:720,filterSweep:320,noteIntervalMs:1500,pulse:!0,padGain:.048},civic:{chord:[65.4,98,130.8,164.8],scale:[261.6,327.5,392,436,523.3],filterBase:480,filterSweep:200,noteIntervalMs:2300,pulse:!1,padGain:.052}};class Cu{constructor(){xe(this,"context");xe(this,"master");xe(this,"reverbSend");xe(this,"musicGain");xe(this,"sfxGain");xe(this,"ambienceBedGain");xe(this,"padVoices",[]);xe(this,"padLfo");xe(this,"currentTheme");xe(this,"melodyTimer",0);xe(this,"pulseTimer",0);xe(this,"muted",!0);xe(this,"sampleSpecs",{});xe(this,"sampleBuffers",new Map);xe(this,"ambienceBedSource");xe(this,"samplesReady");this.samplesReady=this.loadManifest()}async loadManifest(){try{const e=await fetch("/audio/manifest.json",{cache:"no-cache"});if(!e.ok)return;const t=await e.json();this.sampleSpecs=(t==null?void 0:t.samples)??{}}catch{}}async getSample(e){if(this.sampleBuffers.has(e))return this.sampleBuffers.get(e);const t=this.sampleSpecs[e];if(t)try{const n=await fetch(`/audio/${t.file}`,{cache:"force-cache"});if(!n.ok)return;const s=await n.arrayBuffer(),r=await this.ensureContext().decodeAudioData(s);return this.sampleBuffers.set(e,r),r}catch{return}}async playSample(e){var o;await this.samplesReady;const t=await this.getSample(e);if(!t)return!1;const n=this.ensureContext(),s=n.createBufferSource(),r=n.createGain();return r.gain.value=((o=this.sampleSpecs[e])==null?void 0:o.gain)??.6,s.buffer=t,s.connect(r),r.connect(this.sfxGain),r.connect(this.reverbSend),s.start(),!0}startAmbience(e){const t=this.ensureContext();if(this.resume(),this.startCityBed(),this.currentTheme===e&&this.padVoices.length>0)return;this.stopPadAndMelody(),this.currentTheme=e;const n=Au[e],s=t.createOscillator(),r=t.createGain();s.frequency.value=.05+Math.random()*.03,r.gain.value=n.filterSweep,s.connect(r),s.start(),this.padLfo=s,this.padVoices=n.chord.map((a,l)=>{const c=t.createOscillator(),u=t.createBiquadFilter(),h=t.createGain();c.type=l===0?"sine":l===n.chord.length-1?"triangle":"sawtooth",c.frequency.value=a,c.detune.value=(Math.random()-.5)*8,u.type="lowpass",u.frequency.value=n.filterBase,u.Q.value=.8,r.connect(u.frequency);const d=n.padGain/(1+l*.35);return h.gain.setValueAtTime(0,t.currentTime),h.gain.linearRampToValueAtTime(d,t.currentTime+2.2),c.connect(u),u.connect(h),h.connect(this.musicGain),h.connect(this.reverbSend),c.start(),{osc:c,gain:h,filter:u}});const o=()=>{this.currentTheme===e&&(this.playMelodyNote(n),this.melodyTimer=window.setTimeout(o,n.noteIntervalMs*(.7+Math.random()*.6)))};if(this.melodyTimer=window.setTimeout(o,1200),n.pulse){const a=()=>{this.currentTheme===e&&(this.playTone(n.chord[0],n.chord[0],.5,.035,"sine"),this.pulseTimer=window.setTimeout(a,1400))};this.pulseTimer=window.setTimeout(a,900)}}async startCityBed(){var r;if(this.ambienceBedSource)return;await this.samplesReady;const e=await this.getSample("cityAmbience");if(!e||this.ambienceBedSource)return;const t=this.ensureContext(),n=t.createBufferSource();n.buffer=e,n.loop=!0,n.connect(this.ambienceBedGain);const s=((r=this.sampleSpecs.cityAmbience)==null?void 0:r.gain)??.32;this.ambienceBedGain.gain.setValueAtTime(0,t.currentTime),this.ambienceBedGain.gain.linearRampToValueAtTime(s,t.currentTime+3),n.start(),this.ambienceBedSource=n}playMelodyNote(e){const t=this.ensureContext(),n=e.scale[Math.floor(Math.random()*e.scale.length)],s=t.createOscillator(),r=t.createGain(),o=t.currentTime;s.type="triangle",s.frequency.value=n,r.gain.setValueAtTime(1e-4,o),r.gain.exponentialRampToValueAtTime(.045,o+.08),r.gain.exponentialRampToValueAtTime(1e-4,o+1.8),s.connect(r),r.connect(this.musicGain),r.connect(this.reverbSend),s.start(o),s.stop(o+1.85)}playEvent(e){this.resume(),this.playSample(e).then(t=>{t||this.synthEvent(e)})}synthEvent(e){if(e==="heat"){this.playTone(140,70,1.1,.085,"sawtooth",!0),this.playNoise(.9,820,.05,!0),window.setTimeout(()=>this.playTone(96,60,.9,.06,"triangle"),90);return}if(e==="rain"){this.playNoise(1.3,1400,.085,!0),this.playNoise(.6,240,.06,!0),this.playTone(70,48,1,.05,"sine");return}if(e==="air"){this.playNoise(1.4,380,.06,!0),this.playTone(84,74,1.1,.05,"sine",!0);return}if(e==="energy"){[180,240,300,360].forEach((t,n)=>window.setTimeout(()=>this.playTone(t,t*1.4,.16,.055,"square",!0),n*110));return}this.playTone(294,392,.4,.06,"sine",!0),window.setTimeout(()=>this.playTone(392,523,.5,.05,"triangle",!0),150)}playPolicy(){this.resume(),this.playSample("spend").then(e=>{e||this.synthCash()}),this.playSample("policy").then(e=>{e||([523,659,784,1047].forEach((t,n)=>window.setTimeout(()=>this.playTone(t,t,.2,.05,"triangle",!0),n*70)),window.setTimeout(()=>this.playTone(392,588,.3,.045,"sine",!0),300))})}synthCash(){this.playTone(1318,1318,.08,.06,"square",!0),window.setTimeout(()=>this.playTone(1568,1568,.1,.05,"square",!0),70),window.setTimeout(()=>this.playNoise(.18,3200,.04,!0),120),window.setTimeout(()=>this.playNoise(.14,2400,.03,!0),200)}playSelect(){this.resume(),this.playSample("select").then(e=>{e||this.playTone(560,660,.1,.03,"sine")})}playSuccess(){this.resume(),this.playSample("success").then(e=>{e||([392,494,587,784].forEach((t,n)=>window.setTimeout(()=>this.playTone(t,t,.35,.06,"triangle",!0),n*120)),window.setTimeout(()=>this.playTone(1047,1047,.6,.05,"sine",!0),520))})}playFailure(){this.resume(),this.playSample("failure").then(e=>{e||([330,277,233,165].forEach((t,n)=>window.setTimeout(()=>this.playTone(t,t*.9,.4,.06,"sawtooth",!0),n*150)),window.setTimeout(()=>this.playTone(110,70,1,.07,"sine",!0),600))})}setMuted(e){this.muted=e;const t=this.ensureContext(),n=e?0:.32;this.master.gain.cancelScheduledValues(t.currentTime),this.master.gain.setTargetAtTime(n,t.currentTime,.1),e||this.resume()}ensureContext(){if(this.context)return this.context;const e=window.AudioContext??window.webkitAudioContext;if(!e)throw new Error("此瀏覽器不支援 Web Audio。");const t=new e;this.context=t;const n=t.createGain();n.gain.value=this.muted?0:.32,n.connect(t.destination),this.master=n;const s=t.createConvolver();s.buffer=this.buildImpulseResponse(t,2.6,2.4);const r=t.createGain();r.gain.value=.32;const o=t.createGain();o.gain.value=1,o.connect(s),s.connect(r),r.connect(n),this.reverbSend=o;const a=t.createGain();a.gain.value=.6,a.connect(n),this.musicGain=a;const l=t.createGain();l.gain.value=.9,l.connect(n),this.sfxGain=l;const c=t.createGain();return c.gain.value=0,c.connect(n),this.ambienceBedGain=c,t}buildImpulseResponse(e,t,n){const s=e.sampleRate,r=Math.floor(s*t),o=e.createBuffer(2,r,s);for(let a=0;a<2;a+=1){const l=o.getChannelData(a);for(let c=0;c<r;c+=1)l[c]=(Math.random()*2-1)*Math.pow(1-c/r,n)}return o}resume(){const e=this.ensureContext();e.state==="suspended"&&e.resume()}stopPadAndMelody(){if(!this.context)return;const e=this.context.currentTime;window.clearTimeout(this.melodyTimer),window.clearTimeout(this.pulseTimer);for(const t of this.padVoices)t.gain.gain.cancelScheduledValues(e),t.gain.gain.setTargetAtTime(0,e,.4),t.osc.stop(e+1.2);this.padVoices=[],this.padLfo&&(this.padLfo.stop(e+1.2),this.padLfo=void 0)}playTone(e,t,n,s,r,o=!1){const a=this.ensureContext(),l=a.createOscillator(),c=a.createGain(),u=a.currentTime;l.type=r,l.frequency.setValueAtTime(e,u),l.frequency.exponentialRampToValueAtTime(Math.max(20,t),u+n),c.gain.setValueAtTime(1e-4,u),c.gain.exponentialRampToValueAtTime(s,u+.025),c.gain.exponentialRampToValueAtTime(1e-4,u+n),l.connect(c),c.connect(this.master),o&&c.connect(this.reverbSend),l.start(u),l.stop(u+n+.02)}playNoise(e,t,n,s=!1){const r=this.ensureContext(),o=r.createBuffer(1,Math.floor(r.sampleRate*e),r.sampleRate),a=o.getChannelData(0);for(let d=0;d<a.length;d+=1)a[d]=Math.random()*2-1;const l=r.createBufferSource(),c=r.createBiquadFilter(),u=r.createGain(),h=r.currentTime;l.buffer=o,c.type="bandpass",c.frequency.value=t,c.Q.value=.9,u.gain.setValueAtTime(1e-4,h),u.gain.exponentialRampToValueAtTime(n,h+.04),u.gain.exponentialRampToValueAtTime(1e-4,h+e),l.connect(c),c.connect(u),u.connect(this.master),s&&u.connect(this.reverbSend),l.start(h),l.stop(h+e+.02)}}function Lr(i){let e=i|0;return e=e+2654435769|0,e=Math.imul(e^e>>>16,569420461),e=Math.imul(e^e>>>15,1935289751),(e^e>>>15)>>>0}function pc(i,...e){let t=Lr(i);for(const n of e)t=Lr(t^Lr(n));return t/4294967296}function Ru(i,e,...t){const n=Math.floor(pc(e,...t)*i.length);return i[Math.min(i.length-1,n)]}function Pu(){return Math.floor(Math.random()*4294967295)>>>0}function Va(i){return pc(10368889,i)}const hn=16,Yn=4,wa={pavement:{type:"pavement",label:"硬鋪面",color:5068382,imperviousness:1,canopy:0,solar:0,scienceNote:"柏油與水泥吸熱儲熱、不透水，是熱島與逕流的主因。"},building:{type:"building",label:"建築",color:3820118,imperviousness:1,canopy:0,solar:0,scienceNote:"屋頂與牆面同樣吸熱不透水，但可改造為太陽能或綠屋頂。"},green:{type:"green",label:"樹冠綠地",color:3050319,buildCost:3,imperviousness:.05,canopy:1,solar:0,scienceNote:"樹蔭減少地表吸熱、蒸散帶走熱量（Ziter et al. 2019：樹冠 +10% ≈ −2.5°C）。"},permeable:{type:"permeable",label:"透水鋪面",color:8232042,buildCost:4,imperviousness:.2,canopy:.1,solar:0,scienceNote:"讓雨水滲入或暫存，降低逕流係數（合理化公式 C ≈ 0.05+0.85×不透水率）。"},water:{type:"water",label:"滯洪水體",color:2981800,buildCost:5,imperviousness:0,canopy:0,solar:0,scienceNote:"滯洪池與濕地暫存洪峰水量，亦有局部蒸發降溫效果。"},solar:{type:"solar",label:"太陽能",color:9072585,buildCost:4,imperviousness:.9,canopy:0,solar:1,scienceNote:"屋頂光電提高能源安全並降低電網尖峰的化石燃料依賴。"},shelter:{type:"shelter",label:"避難設施",color:13209917,imperviousness:.9,canopy:0,solar:0,scienceNote:"冷房避難點不改變氣溫（Hazard），但降低脆弱族群的熱暴露（Vulnerability）。"}};function Lu(i){let e=0,t=0,n=0,s=0,r=0;for(const a of i){const l=wa[a];e+=l.imperviousness,t+=l.canopy,n+=l.solar,a==="water"&&(s+=1),a==="shelter"&&(r+=1)}const o=Math.max(1,i.length);return{imperviousness:e/o,canopyCover:t/o,solarCoverage:n/o,floodDefenseBonus:s*.04,coolingAccessBonus:r*.06}}function Du(i,e){const t=[],n=Math.round(i.canopyCover*hn),s=Math.round(i.solarCoverage*hn*.8),r=i.coolingAccess>.38?1:0,o=Math.max(0,Math.round((1-i.imperviousness)*hn)-n),a=Math.min(hn-n-s-r-o,6+Math.floor(Iu(i.id,e)*3));for(let l=0;l<n;l+=1)t.push("green");for(let l=0;l<o;l+=1)t.push("permeable");for(let l=0;l<s;l+=1)t.push("solar");for(let l=0;l<r;l+=1)t.push("shelter");for(let l=0;l<Math.max(0,a);l+=1)t.push("building");for(;t.length<hn;)t.push("pavement");t.length=hn;for(let l=t.length-1;l>0;l-=1){const c=Math.floor(Va(e%9973+l*37+i.id.length*11)*(l+1));[t[l],t[c]]=[t[c],t[l]]}return t}function Iu(i,e){let t=e;for(let n=0;n<i.length;n+=1)t=t*31+i.charCodeAt(n)|0;return Va(Math.abs(t))}function Uu(i,e,t,n){const s=[...i],r=Math.max(1,Math.ceil(Math.abs(t)*hn)),o=(a,l,c)=>{let u=c;const h=Math.floor(Va(n+c*13)*hn);for(let d=0;d<hn&&u>0;d+=1){const f=(h+d)%hn;a.includes(s[f])&&(s[f]=l,u-=1)}};return e==="canopyCover"&&t>0?o(["pavement","permeable"],"green",r):e==="imperviousness"&&t<0?o(["pavement"],"permeable",r):e==="solarCoverage"&&t>0&&o(["building","pavement"],"solar",r),s}const Aa=[{id:"ssp126",name:"SSP1-2.6 永續轉型",shortName:"SSP1-2.6",description:"全球快速減排、本世紀中接近淨零。升溫趨緩，但已鎖定的暖化仍需要調適。",warmingPerYearC:.02,heatwaveDaysPerYear:.25,tropicalNightsPerYear:.45,monthlyPrecipPerYearMm:.7,heavyRainDaysPerYear:.08,precipAnomalyPerYear:.005},{id:"ssp245",name:"SSP2-4.5 中間路線",shortName:"SSP2-4.5",description:"全球延續目前政策力道。升溫與極端事件持續增加，是常用的「中間」參考情境。",warmingPerYearC:.027,heatwaveDaysPerYear:.4,tropicalNightsPerYear:.7,monthlyPrecipPerYearMm:1.2,heavyRainDaysPerYear:.15,precipAnomalyPerYear:.01},{id:"ssp585",name:"SSP5-8.5 高排放",shortName:"SSP5-8.5",description:"化石燃料密集發展。升溫最快、極端事件最劇烈，常作為高風險壓力測試情境。",warmingPerYearC:.043,heatwaveDaysPerYear:.7,tropicalNightsPerYear:1.1,monthlyPrecipPerYearMm:1.9,heavyRainDaysPerYear:.24,precipAnomalyPerYear:.016}],Nu="ssp245";function Ou(i){return Aa.find(e=>e.id===i)??Aa[1]}function nt(i,e=0,t=100){return Math.min(t,Math.max(e,i))}function Ca(i){return nt(i,0,1)}function Ye(i,e=0){const t=10**e;return Math.round(i*t)/t}function _n(i,e,t){const n=i.reduce((s,r)=>s+t(r),0);return n<=0?0:i.reduce((s,r)=>s+e(r)*t(r),0)/n}const Fu=new Set(["urban-tree-canopy","cooling-shelters","wetland-buffer","citizen-science-network"]),Bu=[{name:"標準熱浪警戒",briefingHook:"中央氣象單位發布連續高溫警戒，市府要求在四回合內完成降溫、健康與公平三項調適目標。",heatTarget:55,healthTarget:66,equityTarget:58,budgetTarget:10,coolingActionsTarget:2,policyLimitPerTurn:2}];function mc(i){const e=Bu[0];return{id:"heatwave-watch",chapter:"第 1 章",title:`熱浪警戒：${e.name}`,briefing:`${e.briefingHook} 每回合最多只能審議 ${e.policyLimitPerTurn} 項政策，請先閱讀政策說明，再決定是否花費預算。`,stakes:"你扮演城市韌性小組，必須在有限預算與有限行政量能下保護居民。成功不是把所有政策買完，而是用證據判斷哪個區域最需要哪種介入。",turnLimit:4,policyLimitPerTurn:e.policyLimitPerTurn,status:"briefing",objectives:Gu(e).map(t=>({...t,current:0,passed:!1}))}}const zu=[{index:0,title:"熱浪警戒",blurb:"高溫與熱夜衝擊健康與公平，用樹冠、避難網絡與海綿街廓降溫。"},{index:1,title:"颱風洪峰",blurb:"短延時強降雨考驗排水。觀察逕流圖層，布置透水與滯洪設施。"},{index:2,title:"靜風空污",blurb:"靜風期 PM2.5 累積。管制排放、綠運輸與綠帶多管齊下。"},{index:3,title:"能源轉型",blurb:"尖峰用電逼近極限。鋪設太陽能、強化綠運輸，兼顧健康與減排。"}],mo=[{id:"heatwave-watch",chapter:"第 1 章",title:"熱浪警戒",briefing:"",stakes:"",objectives:[]},{id:"typhoon-flood",chapter:"第 2 章",title:"颱風洪峰：海綿城市考驗",briefing:"颱風季來臨，外圍環流的短延時強降雨將考驗排水系統。河岸與海港低窪區的逕流係數是關鍵——觀察「逕流」圖層，把透水設施放在最需要的地方。",stakes:"上一章的降溫投資仍然有效，但這一章雨水不會等你。每回合最多 2 項政策，也可直接在地格上建造透水鋪面與滯洪水體。",objectives:[{id:"lower-flood",label:"洪水風險 <= 56",metric:"floodRisk",comparator:"<=",target:56,helper:"洪水風險由極端降雨（Hazard）×逕流（地表）×防洪設施（Vulnerability）組成。"},{id:"protect-health-2",label:"公共健康 >= 64",metric:"publicHealth",comparator:">=",target:64,helper:"淹水會直接衝擊健康（傷亡、傳染病、心理壓力）。"},{id:"keep-trust",label:"公眾信任 >= 58",metric:"publicTrust",comparator:">=",target:58,helper:"防災溝通與透明決策維持市民信任。"},{id:"keep-budget-2",label:"剩餘預算 >= 10",metric:"budget",comparator:">=",target:10,unit:" 百萬",helper:"颱風季後還需要修復預算。"}]},{id:"stagnant-smog",chapter:"第 3 章",title:"靜風空污：呼吸保衛戰",briefing:"秋冬靜風期讓 PM2.5 不易擴散，工業區與交通幹道周邊暴露上升。切換「空污」圖層找出熱點，用排放管制、綠運輸與綠帶吸附多管齊下。",stakes:"AQI 已對齊 EPA 官方類別——讓城市離開橘色（對敏感族群不健康）區間。",objectives:[{id:"lower-air",label:"空氣風險 <= 38",metric:"airQualityRisk",comparator:"<=",target:38,helper:"空氣風險由區域 AQI 基準與街區排放源組成。"},{id:"protect-health-3",label:"公共健康 >= 67",metric:"publicHealth",comparator:">=",target:67,helper:"PM2.5 與呼吸道、心血管疾病有明確的劑量反應關係。"},{id:"lower-emissions",label:"排放 <= 62",metric:"emissions",comparator:"<=",target:62,helper:"管制本地排放同時改善空品與碳排。"},{id:"keep-budget-3",label:"剩餘預算 >= 8",metric:"budget",comparator:">=",target:8,unit:" 百萬",helper:"保留下一章能源轉型的本錢。"}]},{id:"energy-transition",chapter:"第 4 章",title:"能源轉型：尖峰與淨零",briefing:"連年熱浪推升冷氣用電，電網逼近極限。鋪設太陽能（地格建造或政策）、強化綠運輸，在不犧牲健康的前提下完成能源轉型。",stakes:"最終章：調適與減緩必須同時成立。完成後城市進入自由沙盒。",objectives:[{id:"energy-secure",label:"能源安全 >= 68",metric:"energySecurity",comparator:">=",target:68,helper:"分散式太陽能降低尖峰時段的電網壓力。"},{id:"deep-cut",label:"排放 <= 52",metric:"emissions",comparator:"<=",target:52,helper:"淨零路徑需要運輸、產業、能源同時減排。"},{id:"protect-health-4",label:"公共健康 >= 68",metric:"publicHealth",comparator:">=",target:68,helper:"能源轉型不能以健康為代價。"},{id:"keep-trust-4",label:"公眾信任 >= 60",metric:"publicTrust",comparator:">=",target:60,helper:"轉型正義：讓市民理解並支持轉型的代價與效益。"}]}];function go(i,e){if(e<=0)return mc();const t=mo[Math.min(e,mo.length-1)];return{id:t.id,chapter:t.chapter,title:t.title,briefing:t.briefing,stakes:t.stakes,turnLimit:4,policyLimitPerTurn:2,status:"briefing",objectives:t.objectives.map(n=>({...n,current:0,passed:!1}))}}function ku(i){if(i.mission.status!=="briefing")return i;const e={...i,mission:{...i.mission,status:"active"},eventLog:["任務開始：先觀察城市指標與選定街區，再查看政策詳情並確認投資。",...i.eventLog].slice(0,10)};return Ms(e,{allowCompletion:!1})}function Ms(i,e){const t=i.mission,n=t.objectives.map(u=>Vu(i,u)),s=n.every(u=>u.passed),r=i.turn>t.turnLimit;let o=t.status,a=i.phase,l=t.debriefTitle,c=t.debriefBody;return n.length===0?{...i,mission:{...t,objectives:n}}:(e.allowCompletion&&o==="active"&&s?(o="won",a="complete",l=`副本「${t.title}」達成`,c="本副本目標全部達成！可以挑戰其他副本，比較不同災害需要的調適策略——降溫、防洪、空品與能源其實共用同一套科學框架。"):e.allowCompletion&&o==="active"&&r&&(o="lost",a="complete",l="任務未達標",c=Xu(n)),{...i,phase:a,mission:{...t,status:o,objectives:n,debriefTitle:l,debriefBody:c}})}function Hu(i){return Math.max(0,i.mission.turnLimit-i.turn+1)}function Gu(i){return[{id:"lower-heat",label:`熱風險 <= ${i.heatTarget}`,metric:"heatRisk",comparator:"<=",target:i.heatTarget,helper:"熱風險越高，代表高溫暴露、硬鋪面與降溫不足的壓力越大。"},{id:"protect-health",label:`公共健康 >= ${i.healthTarget}`,metric:"publicHealth",comparator:">=",target:i.healthTarget,helper:"公共健康受到熱暴露、淹水、空污與照護可近性的共同影響。"},{id:"protect-equity",label:`公平性 >= ${i.equityTarget}`,metric:"equity",comparator:">=",target:i.equityTarget,helper:"公平性代表弱勢族群能否同樣取得降溫、交通與資訊服務。"},{id:"heat-actions",label:`降溫介入 >= ${i.coolingActionsTarget}`,metric:"coolingInterventions",comparator:">=",target:i.coolingActionsTarget,helper:"至少完成兩項與熱保護有關的政策，避免只靠單一方案。"},{id:"keep-budget",label:`剩餘預算 >= ${i.budgetTarget}`,metric:"budget",comparator:">=",target:i.budgetTarget,unit:" 百萬",helper:"保留預算代表城市還能面對下一次災害或維護支出。"}]}function Vu(i,e){const t=Wu(i,e.metric),n=e.comparator===">="?t>=e.target:t<=e.target;return{...e,current:Ye(t,e.metric==="coolingInterventions"?0:1),passed:n}}function Wu(i,e){return e==="budget"?i.budget:e==="turn"?i.turn:e==="coolingInterventions"?i.appliedPolicies.filter(t=>Fu.has(t.policyId)).length:i[e]}function Xu(i){return`城市已經完成部分調適，但還沒有達成任務門檻。未達標項目：${i.filter(t=>!t.passed).map(t=>t.label).join("、")||"無"}。下次可以先閱讀政策詳情，找出哪些政策能直接處理熱暴露、健康或公平性。`}const $u={latitude:25.033,longitude:121.5654},jt={meanTemperatureC:28.4,temperatureAnomalyC:1.4,heatwaveDaysPerSeason:18,tropicalNightsPerSeason:64,monthlyPrecipitationMm:265,precipitationAnomalyRatio:1.18,heavyRainDaysPerSeason:8,pm25UgM3:14.8,solarKwhM2Day:3.78,population:249e4,urbanPopulationRatio:.95},_o=[{id:"heat-dome",title:"高壓熱穹頂",body:"副熱帶高壓盤據，夜間降溫不足。柏油與水泥白天吸熱、夜間釋熱，市中心與弱勢住宅區熱暴露快速升高。",scienceNote:"熱浪會讓人體散熱變困難，夜間高溫尤其危險，因為身體沒有恢復時間。樹蔭、冷房與低熱容量鋪面都能降低暴露。",soundCue:"heat",pressure:{heatRisk:8,publicHealth:-4,equity:-3}},{id:"typhoon-rainband",title:"颱風雨帶滯留",body:"外圍環流帶來短延時強降雨，河岸與低窪街區排水壓力升高。若不透水面比例高，雨水會更快形成地表逕流。",scienceNote:"強降雨風險不只看雨量，也看地表能不能吸收或暫存雨水。海綿街廓、濕地與滯洪空間可削減洪峰。",soundCue:"rain",pressure:{floodRisk:10,publicTrust:-3}},{id:"stagnant-air",title:"靜風空污累積",body:"風速偏弱讓污染物不易擴散，工業區與交通幹道周邊 PM2.5 暴露上升，呼吸道敏感族群受到影響。",scienceNote:"空氣污染濃度會受排放量與擴散條件影響。低風速、逆溫或高排放都會讓污染累積在近地面。",soundCue:"air",pressure:{airQualityRisk:8,publicHealth:-3}},{id:"energy-peak",title:"尖峰用電拉警報",body:"連續高溫推升冷氣用電，電網備轉容量下降。若供電以化石燃料補足，排放與空污可能同步上升。",scienceNote:"氣候調適與減緩會互相牽動。熱浪需要冷房保護健康，但若能源系統不低碳，降溫也可能增加排放。",soundCue:"energy",pressure:{energySecurity:-5,emissions:5}},{id:"budget-review",title:"市議會預算審查",body:"民眾要求市府解釋每項支出的證據基礎。資料透明與公民參與能提升信任，但缺乏說明會削弱支持度。",scienceNote:"永續政策需要科學證據，也需要社會溝通。學生可以練習把指標、模型假設與政策取捨說清楚。",soundCue:"civic",pressure:{publicTrust:-2,educationScore:4}}];function qu(i=1){return Yu().map(e=>({...e,cells:Du(e,i)}))}function Yu(){return[{id:"harbor",name:"海港低窪區",archetype:"coastal",population:32e4,elevationM:2.5,imperviousness:.76,canopyCover:.13,transitAccess:.58,solarCoverage:.16,floodDefense:.22,coolingAccess:.34,industryLoad:.47,heatExposure:62,floodExposure:74,airPollution:55,healthIndex:58,equityIndex:51,resilienceIndex:44},{id:"core",name:"市中心熱島區",archetype:"downtown",population:51e4,elevationM:8,imperviousness:.89,canopyCover:.08,transitAccess:.82,solarCoverage:.12,floodDefense:.28,coolingAccess:.42,industryLoad:.31,heatExposure:77,floodExposure:48,airPollution:50,healthIndex:61,equityIndex:56,resilienceIndex:49},{id:"riverbend",name:"河岸住宅區",archetype:"river",population:28e4,elevationM:4,imperviousness:.67,canopyCover:.21,transitAccess:.48,solarCoverage:.1,floodDefense:.18,coolingAccess:.31,industryLoad:.19,heatExposure:59,floodExposure:71,airPollution:41,healthIndex:64,equityIndex:58,resilienceIndex:46},{id:"industry",name:"產業排放區",archetype:"industrial",population:21e4,elevationM:6,imperviousness:.81,canopyCover:.07,transitAccess:.39,solarCoverage:.21,floodDefense:.25,coolingAccess:.24,industryLoad:.78,heatExposure:72,floodExposure:56,airPollution:78,healthIndex:49,equityIndex:47,resilienceIndex:39},{id:"garden",name:"花園住宅區",archetype:"residential",population:43e4,elevationM:12,imperviousness:.58,canopyCover:.29,transitAccess:.54,solarCoverage:.18,floodDefense:.32,coolingAccess:.43,industryLoad:.12,heatExposure:48,floodExposure:39,airPollution:33,healthIndex:72,equityIndex:64,resilienceIndex:61},{id:"hillside",name:"山坡保育區",archetype:"upland",population:12e4,elevationM:28,imperviousness:.32,canopyCover:.48,transitAccess:.34,solarCoverage:.14,floodDefense:.38,coolingAccess:.29,industryLoad:.08,heatExposure:37,floodExposure:31,airPollution:28,healthIndex:75,equityIndex:59,resilienceIndex:68}]}function Wa(i=jt,e={}){const t=e.seed??Pu();return{cityId:"taipei",seed:t,scenario:e.scenario??Nu,mode:e.mode??"campaign",missionIndex:0,cityName:"台北氣候韌性實驗城",coordinates:$u,countryCode:"TWN",turn:1,maxTurns:4,year:2026,phase:"planning",budget:64,emissions:72,heatRisk:63,floodRisk:58,airQualityRisk:52,publicHealth:61,equity:56,publicTrust:62,biodiversity:43,energySecurity:55,educationScore:42,sdgScore:56,climateSignals:i,selectedDistrictId:"core",currentChallenge:gc(t,1),mission:mc(),districts:qu(t),appliedPolicies:[],eventLog:["模擬城初始化：請啟動熱浪任務，觀察各區風險差異後再投資政策。"],evidenceLog:[]}}function gc(i,e,t){const n=_o.filter(r=>r.id!==t),s=n.length>0?n:_o;return Ru(s,i,e,805393)}const ju=5500,ar={min:-30,max:55},Ra={min:0,max:1e3},Ku={min:0,max:12},_c={min:0,max:500},Dr=5,Pa=6,Zu=27,vo=260,Ju=7,Qu=36,eh=25,th=50;async function nh(i){const e=vc(),t=await Promise.all(e.ranges.map(g=>rh(i,g))),n=t.reduce((g,v)=>g.concat(v.dailyMeanTemps),[]),s=t.reduce((g,v)=>g.concat(v.dailyMaxTemps),[]),r=t.reduce((g,v)=>g.concat(v.dailyMinTemps),[]),o=t.reduce((g,v)=>g.concat(v.dailyRain),[]),a=oh(n,28,ar),l=Ir(s,Qu,ar)/e.years,c=Ir(r,eh,ar)/e.years,u=Ir(o,th,Ra)/e.years,h=lh(o,vo*Pa*e.years,Ra),d=La(h/(e.years*Pa),0,1500),f=La(d/vo*.62+u/Ju*.38,.2,4);return{meanTemperatureC:a,temperatureAnomalyC:a-Zu,heatwaveDaysPerSeason:Ur(l,1),tropicalNightsPerSeason:Ur(c,1),monthlyPrecipitationMm:d,precipitationAnomalyRatio:f,heavyRainDaysPerSeason:Ur(u,1)}}async function ih(i){const e=vc(),t=await Promise.all(e.ranges.map(u=>ah(i,u))),n=t.reduce((u,h)=>u.concat(h.temp),[]),s=t.reduce((u,h)=>u.concat(h.precipitation),[]),r=t.reduce((u,h)=>u.concat(h.solar),[]),o=cr(n,ar),a=ch(s,Ra),l=cr(r,Ku),c={};return o!==void 0&&(c.meanTemperatureC=o),a!==void 0&&(c.monthlyPrecipitationMm=La(a/(e.years*Pa),0,1500)),l!==void 0&&(c.solarKwhM2Day=l),c}async function sh(i){var o;const e=new URLSearchParams({latitude:String(i.latitude),longitude:String(i.longitude),hourly:"pm2_5",past_days:"7",timezone:"auto",cell_selection:"land"}),t=await Mr(`https://air-quality-api.open-meteo.com/v1/air-quality?${e}`);if(!t.ok)throw new Error(`Open-Meteo Air Quality failed: ${t.status}`);const n=await t.json(),s=Array.isArray((o=n.hourly)==null?void 0:o.pm2_5)?n.hourly.pm2_5:[],r=cr(s,_c);return r!==void 0?{pm25UgM3:r}:{}}async function xo(i,e){var a,l;if(!e)return{};const t=new URLSearchParams({coordinates:`${i.latitude},${i.longitude}`,radius:"25000",limit:"20"}),n=await Mr(`https://api.openaq.org/v3/locations?${t}`,{headers:{"X-API-Key":e}});if(!n.ok)throw new Error(`OpenAQ failed: ${n.status}`);const s=await n.json(),r=[];for(const c of s.results??[])for(const u of c.sensors??[]){const h=String(((a=u.parameter)==null?void 0:a.name)??"").toLowerCase();if(h==="pm25"||h==="pm2.5"){const d=(l=u.latest)==null?void 0:l.value;typeof d=="number"&&r.push(d)}}const o=cr(r,_c);return o!==void 0?{pm25UgM3:o}:{}}async function rh(i,e){var r,o,a,l;const t=new URLSearchParams({latitude:String(i.latitude),longitude:String(i.longitude),start_date:e.start,end_date:e.end,daily:"temperature_2m_mean,temperature_2m_max,temperature_2m_min,precipitation_sum",timezone:"auto",cell_selection:"land"}),n=await Mr(`https://archive-api.open-meteo.com/v1/archive?${t}`);if(!n.ok)throw new Error(`Open-Meteo ${e.year} failed: ${n.status}`);const s=await n.json();return{dailyMeanTemps:((r=s.daily)==null?void 0:r.temperature_2m_mean)??[],dailyMaxTemps:((o=s.daily)==null?void 0:o.temperature_2m_max)??[],dailyMinTemps:((a=s.daily)==null?void 0:a.temperature_2m_min)??[],dailyRain:((l=s.daily)==null?void 0:l.precipitation_sum)??[]}}async function ah(i,e){var o;const t=new URLSearchParams({parameters:"T2M,PRECTOTCORR,ALLSKY_SFC_SW_DWN",community:"RE",longitude:String(i.longitude),latitude:String(i.latitude),start:yo(e.start),end:yo(e.end),format:"JSON"}),n=await Mr(`https://power.larc.nasa.gov/api/temporal/daily/point?${t}`);if(!n.ok)throw new Error(`NASA POWER ${e.year} failed: ${n.status}`);const r=((o=(await n.json()).properties)==null?void 0:o.parameter)??{};return{temp:Object.values(r.T2M??{}),precipitation:Object.values(r.PRECTOTCORR??{}),solar:Object.values(r.ALLSKY_SFC_SW_DWN??{})}}function oh(i,e,t){const n=Ss(i,t);return n.length===0?e:n.reduce((s,r)=>s+r,0)/n.length}function lh(i,e,t){const n=Ss(i,t);return n.length===0?e:n.reduce((s,r)=>s+r,0)}function cr(i,e){const t=Ss(i,e);if(t.length!==0)return t.reduce((n,s)=>n+s,0)/t.length}function ch(i,e){const t=Ss(i,e);if(t.length!==0)return t.reduce((n,s)=>n+s,0)}function Ir(i,e,t){return Ss(i,t).filter(n=>n>=e).length}function Ss(i,e){return i.map(t=>uh(t,e)).filter(t=>t!==void 0)}function uh(i,e){if(!(typeof i!="number"||!Number.isFinite(i))&&!(i<=-900)&&!(e&&(i<e.min||i>e.max)))return i}function La(i,e,t){return Math.min(t,Math.max(e,i))}function Ur(i,e=0){const t=10**e;return Math.round(i*t)/t}async function Mr(i,e={}){const t=new AbortController,n=window.setTimeout(()=>t.abort(),ju);try{return await fetch(i,{...e,signal:e.signal??t.signal})}finally{window.clearTimeout(n)}}function vc(i=new Date){const e=i.getUTCFullYear(),n=i.getUTCMonth()+1>=11?e:e-1,s=n-Dr+1;return{ranges:Array.from({length:Dr},(o,a)=>{const l=s+a;return{year:l,start:`${l}-05-01`,end:`${l}-10-31`}}),years:Dr,startYear:s,endYear:n}}function yo(i){return i.replace(/-/g,"")}const hh={population:2455e3,urbanPopulationRatio:.95},dh="climate-resilience-lab/api-cache/v1/",fh=12*60*60*1e3;async function Cs(i,e){const t=`${dh}${i}`;try{const s=window.localStorage.getItem(t);if(s){const r=JSON.parse(s);if(Date.now()-r.t<fh)return r.v}}catch{}const n=await e();try{window.localStorage.setItem(t,JSON.stringify({t:Date.now(),v:n}))}catch{}return n}async function ph(i,e){const t=await mh(),n={id:"localBaseline",name:"台北本地基準補值",status:"fallback",fields:["暖季均溫","熱浪日","熱夜日","暖季月雨量","強降雨日","PM2.5","日照","人口背景"],note:"公開 API 缺漏或無法連線時用來補足欄位，讓課堂仍可討論資料不確定性。"},s=`${i.coordinates.latitude},${i.coordinates.longitude}`,r=[{id:"nasaPower",name:"NASA POWER",fields:["近 5 個完整暖季的太陽輻射、暖季均溫與降雨補充"],loader:()=>Cs(`nasaPower/${s}`,()=>ih(i.coordinates))},{id:"openMeteo",name:"Open-Meteo",fields:["近 5 個完整暖季的熱浪日、熱夜日、強降雨日、暖季月雨量"],loader:()=>Cs(`openMeteo/${s}`,()=>nh(i.coordinates))},{id:"taiwanPop",name:"內政部戶政司人口統計（靜態內建）",fields:["人口背景（臺北市 2024 年底）","都市人口比"],loader:()=>Promise.resolve({...hh})},{id:"openMeteoAir",name:"Open-Meteo 空氣品質（CAMS）",fields:["PM2.5（免金鑰，CAMS 全球/歐洲再分析）"],loader:()=>Cs(`openMeteoAir/${s}`,()=>sh(i.coordinates))},{id:"openAq",name:"OpenAQ（選用，需 API key）",fields:["PM2.5（地面測站，若提供 key 則覆蓋上者）"],loader:()=>e.openAqApiKey?Cs(`openAq/${s}`,()=>xo(i.coordinates,e.openAqApiKey)):xo(i.coordinates,e.openAqApiKey)}],o=await Promise.allSettled(r.map(c=>c.loader())),a=o.reduce((c,u)=>u.status==="fulfilled"?{...c,...Mo(u.value)}:c,{}),l=o.map((c,u)=>{const h=r[u];if(c.status==="rejected")return{id:h.id,name:h.name,status:"failed",fields:h.fields,note:String(c.reason)};const d=Mo(c.value);return Object.keys(d).length>0?{id:h.id,name:h.name,status:"loaded",fields:h.fields,note:"已載入並覆蓋同名起始欄位。"}:{id:h.id,name:h.name,status:"skipped",fields:h.fields,note:h.id==="openAq"?"未設定 OpenAQ API key；PM2.5 已改由 Open-Meteo 空氣品質（CAMS）提供真實值。":"API 回傳資料缺漏，相關欄位使用台北本地基準補值。"}});return{signals:xc({...t,...a}),sources:[...l,n]}}async function mh(){try{const i=await fetch("./data/taipei-climate-baseline.json");if(!i.ok)throw new Error("Local baseline missing");const e=await i.json();return xc(e.baseline)}catch{return jt}}function xc(i){const e=Qt(on(i.meanTemperatureC,jt.meanTemperatureC),15,45),t=Qt(on(i.monthlyPrecipitationMm,jt.monthlyPrecipitationMm),0,1500);return{meanTemperatureC:e,temperatureAnomalyC:Qt(e-27,-10,15),heatwaveDaysPerSeason:Qt(on(i.heatwaveDaysPerSeason,jt.heatwaveDaysPerSeason),0,184),tropicalNightsPerSeason:Qt(on(i.tropicalNightsPerSeason,jt.tropicalNightsPerSeason),0,184),monthlyPrecipitationMm:t,precipitationAnomalyRatio:Qt(on(i.precipitationAnomalyRatio,jt.precipitationAnomalyRatio),.2,5),heavyRainDaysPerSeason:Qt(on(i.heavyRainDaysPerSeason,jt.heavyRainDaysPerSeason),0,80),pm25UgM3:Qt(on(i.pm25UgM3,jt.pm25UgM3),0,500),solarKwhM2Day:Qt(on(i.solarKwhM2Day,jt.solarKwhM2Day),0,12),population:Qt(on(i.population,jt.population),1,1e8),urbanPopulationRatio:Qt(on(i.urbanPopulationRatio,jt.urbanPopulationRatio),0,1)}}function on(i,e){return Number.isFinite(i)?Number(i):e}function Mo(i){return Object.fromEntries(Object.entries(i).filter(([,e])=>e!==void 0))}function Qt(i,e,t){return Math.min(t,Math.max(e,i))}const Xa=[{id:"urban-tree-canopy",name:"都市樹冠降溫",category:"cooling",target:"district",cost:12,sdgs:["SDG 3","SDG 11","SDG 13","SDG 15"],summary:"在街道、校園與熱點周邊增加樹蔭，降低行人熱暴露並改善棲地連通。",evidencePrompt:"樹冠會提高遮蔭與蒸散作用，城市熱島壓力下降，健康與韌性分數同步改善。",learningFocus:"城市熱島、蒸散作用、自然為本解方",scienceNote:"深色鋪面會吸收並儲存太陽輻射，樹蔭能減少地表吸熱，葉片蒸散也會帶走熱量，所以同一個城市裡不同街區會有明顯溫差。",classroomPrompt:"如果學校附近只能種 50 棵樹，你會優先放在人最多、最熱，還是最弱勢的區域？為什麼？",effectExplanation:["樹冠覆蓋率上升，模型會降低該區熱暴露。","降溫通道與可步行陰影增加，健康指標與韌性指標上升。","連續綠地可支持鳥類、昆蟲與土壤生態，因此生物多樣性提高。"],cityEffects:{biodiversity:4,publicTrust:1},districtEffects:{canopyCover:.09,coolingAccess:.04,healthIndex:3,resilienceIndex:4}},{id:"cooling-shelters",name:"降溫避難網絡",category:"health",target:"district",cost:8,sdgs:["SDG 3","SDG 10","SDG 11","SDG 13"],summary:"把圖書館、活動中心、捷運站與校園納入熱浪避難點，照顧長者與戶外工作者。",evidencePrompt:"可抵達的冷房、飲水與照護能降低熱傷害，公平性與公共健康直接受益。",learningFocus:"熱傷害、脆弱族群、調適公平",scienceNote:"熱浪不是只看氣溫，還要看人能不能避開高溫。高齡者、慢性病患者、無空調住戶與戶外工作者暴露時間較長，所以降溫服務會明顯影響健康風險。",classroomPrompt:"如果避難中心只能開 12 小時，應該開白天、夜晚，還是分散到不同時段？你會用什麼資料判斷？",effectExplanation:["冷房與飲水點提高降溫可近性，該區冷卻可及性大幅上升。","弱勢族群有更容易抵達的避難點，公平指標上升。","熱衰竭與熱中暑風險下降，公共健康改善。"],cityEffects:{publicHealth:2,equity:3},districtEffects:{coolingAccess:.14,equityIndex:4,healthIndex:5,resilienceIndex:3}},{id:"permeable-streets",name:"海綿街廓改造",category:"flood",target:"district",cost:14,sdgs:["SDG 6","SDG 9","SDG 11","SDG 13"],summary:"把停車格、人行道與廣場改成透水鋪面、雨水花園與滯洪設施。",evidencePrompt:"不透水面下降，短延時強降雨時的逕流會變少，淹水暴露降低。",learningFocus:"逕流、透水鋪面、都市洪水",scienceNote:"水落在水泥或柏油上會快速流向低處，排水系統來不及處理就可能積淹水。透水鋪面與雨水花園能讓部分雨水滲入或暫時停留。",classroomPrompt:"同樣是花 14 百萬預算，你會先改造商圈、河岸住宅，還是工業區？請用淹水暴露與人口解釋。",effectExplanation:["不透水率下降，降雨形成的地表逕流減少。","排水與滯洪能力提高，洪水防護上升。","淹水壓力較低時，街區韌性指標提升。"],cityEffects:{publicTrust:1},districtEffects:{imperviousness:-.08,floodDefense:.12,resilienceIndex:5}},{id:"wetland-buffer",name:"濕地緩衝帶",category:"biodiversity",target:"district",cost:20,sdgs:["SDG 6","SDG 11","SDG 13","SDG 15"],summary:"在河岸、海岸與低窪地恢復濕地，吸收洪峰並增加自然棲地。",evidencePrompt:"濕地像城市的海綿，可以延緩洪峰、降低水患，同時提高生物多樣性。",learningFocus:"自然為本解方、洪峰削減、濕地生態",scienceNote:"濕地能暫存大量雨水，讓洪峰比較慢到達市區；濕地植物與土壤也能提供棲地、過濾污染物，是兼具防災與生態的調適策略。",classroomPrompt:"濕地需要土地，可能會與開發需求衝突。你會如何向居民說明它的防災價值？",effectExplanation:["洪水防護顯著提高，城市總洪水風險下降。","硬鋪面轉為自然地表，不透水率下降。","棲地面積與水陸交界增加，生物多樣性大幅提升。"],cityEffects:{biodiversity:8,floodRisk:-3},districtEffects:{floodDefense:.16,canopyCover:.05,imperviousness:-.04,resilienceIndex:7}},{id:"solar-rooftops",name:"屋頂太陽能聚落",category:"energy",target:"district",cost:16,sdgs:["SDG 7","SDG 9","SDG 11","SDG 13"],summary:"在學校、公宅與工廠屋頂建置太陽能，搭配社區儲能與能源教育。",evidencePrompt:"太陽能覆蓋率提升會降低外部電力依賴，排放下降，能源安全提高。",learningFocus:"再生能源、尖峰用電、能源安全",scienceNote:"熱浪時空調需求會上升，電網容易吃緊。分散式太陽能能在白天提供本地電力，若搭配儲能，停電或尖峰時更有韌性。",classroomPrompt:"太陽能不一定在晚上發電。你會怎麼設計儲能或用電管理，讓它真正幫助熱浪期間的城市？",effectExplanation:["太陽能覆蓋率上升，能源安全指標提高。","使用化石燃料發電的需求降低，城市排放下降。","學校與公共屋頂示範可連結能源教育，教育分數上升。"],cityEffects:{emissions:-5,energySecurity:6,educationScore:2},districtEffects:{solarCoverage:.13,resilienceIndex:2}},{id:"electric-bus-grid",name:"電動公車與低碳路網",category:"mobility",target:"district",cost:18,sdgs:["SDG 3","SDG 7","SDG 11","SDG 13"],summary:"提升電動公車班距、轉乘節點與安全步行路線，降低私人汽機車依賴。",evidencePrompt:"公共運輸可近性提高時，交通排放與空污下降，健康與信任分數改善。",learningFocus:"低碳交通、空氣污染、可近性",scienceNote:"交通排放包含溫室氣體與空氣污染物。當公共運輸更方便，部分旅次會從私人車輛轉移，城市排放與 PM2.5 來源都會降低。",classroomPrompt:"如果同學覺得公車變多仍不想搭，你還需要哪些配套政策讓交通轉型真的發生？",effectExplanation:["大眾運輸可及性上升，私人車輛依賴下降。","交通排放減少，城市排放與空氣品質風險降低。","通勤選擇變多，公共信任與健康指標改善。"],cityEffects:{emissions:-6,airQualityRisk:-3,publicTrust:2},districtEffects:{transitAccess:.12,healthIndex:3,resilienceIndex:3}},{id:"industrial-filter",name:"產業空污治理",category:"industry",target:"district",cost:10,sdgs:["SDG 3","SDG 9","SDG 11","SDG 12"],summary:"更新工廠排放控制、即時監測與稽核，降低鄰近社區污染暴露。",evidencePrompt:"產業負荷下降會降低街區空污，健康指標與城市空氣品質同步改善。",learningFocus:"PM2.5、環境正義、污染管制",scienceNote:"細懸浮微粒會進入呼吸道並提高健康風險。工業區附近居民暴露較高，因此污染管制同時也是環境正義議題。",classroomPrompt:"如果企業擔心成本上升，你會用哪些健康或社會資料說服城市仍要做空污治理？",effectExplanation:["產業負荷下降，該區空氣污染下降。","污染暴露降低，健康指標提高。","城市平均空氣品質風險降低。"],cityEffects:{airQualityRisk:-4,publicHealth:1},districtEffects:{industryLoad:-.1,healthIndex:4,resilienceIndex:2}},{id:"citizen-science-network",name:"公民科學感測網",category:"governance",target:"city",cost:7,sdgs:["SDG 3","SDG 10","SDG 11","SDG 13"],summary:"讓學生、社區與市府共同佈設溫度、雨量與空氣品質感測點，公開資料儀表板。",evidencePrompt:"資料透明會提升公共信任與科學素養，讓資源分配更公平。",learningFocus:"資料素養、感測器、公民參與",scienceNote:"城市風險常常不是平均分布。感測網可以找出熱點、淹水點與空污熱區，讓政策從「感覺」變成可討論的證據。",classroomPrompt:"感測器可能有誤差。你會如何驗證資料，避免錯誤數據影響政策決策？",effectExplanation:["公開資料讓學生與居民理解風險，教育分數提高。","政策分配更有依據，公共信任提升。","看見弱勢區域的暴露差異，公平指標上升。"],cityEffects:{educationScore:8,publicTrust:5,equity:2}}];function $a(i){return Xa.find(e=>e.id===i)}const gh=25,_h=18.7,vh=.5,xh=.2,yh=5,Mh=[[0,9,0,50],[9.1,35.4,51,100],[35.5,55.4,101,150],[55.5,125.4,151,200],[125.5,225.4,201,300],[225.5,325.4,301,500]],Nr=[{name:"Good",nameZh:"良好",color:"#00e400",aqiLo:0,aqiHi:50,hazardLo:0,hazardHi:20},{name:"Moderate",nameZh:"普通",color:"#ffff00",aqiLo:51,aqiHi:100,hazardLo:20,hazardHi:40},{name:"Unhealthy for Sensitive Groups",nameZh:"對敏感族群不健康",color:"#ff7e00",aqiLo:101,aqiHi:150,hazardLo:40,hazardHi:60},{name:"Unhealthy",nameZh:"不健康",color:"#ff0000",aqiLo:151,aqiHi:200,hazardLo:60,hazardHi:80},{name:"Very Unhealthy",nameZh:"非常不健康",color:"#8f3f97",aqiLo:201,aqiHi:300,hazardLo:80,hazardHi:95},{name:"Hazardous",nameZh:"危害",color:"#7e0023",aqiLo:301,aqiHi:500,hazardLo:95,hazardHi:100}];function Sh(i){const e=Math.max(0,Math.min(500,i));return Nr.find(t=>e<=t.aqiHi)??Nr[Nr.length-1]}function bh(i){const e=Sh(i),t=Math.max(1,e.aqiHi-e.aqiLo),n=(Math.max(e.aqiLo,Math.min(e.aqiHi,i))-e.aqiLo)/t;return e.hazardLo+n*(e.hazardHi-e.hazardLo)}const So=40,Eh=1.7;function Th(i){const e=Math.max(0,Math.min(100,i)-So),t=100-So;return Math.min(100,100*(e/t)**Eh)}const wh=.05,Ah=.85;function Ft(i,e=0,t=100){return Math.min(t,Math.max(e,i))}function Ch(i){const e=Math.max(0,i);for(const[t,n,s,r]of Mh)if(e<=n)return Math.round((r-s)/(n-t)*(e-t)+s);return 500}function yc(i){const e=Ft(20+i.temperatureAnomalyC*6+i.heatwaveDaysPerSeason*.7+i.tropicalNightsPerSeason*.25),t=Ft(15+i.precipitationAnomalyRatio*10+i.heavyRainDaysPerSeason*1.6+i.monthlyPrecipitationMm/20),n=Ch(i.pm25UgM3),s=Ft(bh(n)),r=Ft(28+i.solarKwhM2Day*9);return{heatClimateHazard:e,floodClimateHazard:t,aqiPm25:n,airClimateHazard:s,solarOpportunity:r}}function Rh(i,e){const t=_h*(i.imperviousness-vh)-gh*(i.canopyCover-xh)+(i.archetype==="downtown"?1.5:0)+(i.archetype==="industrial"?.8:0),n=Ft(e.heatClimateHazard+t*yh),s=Ft(1+(.45-i.coolingAccess)*.75+(58-i.equityIndex)/200,.6,1.4),r=Ft(n*s),o=Ft(wh+Ah*i.imperviousness,0,.95),a=Ft(e.floodClimateHazard*(.4+o)),l=Ft(1+(.5-i.floodDefense)*.6-i.elevationM*.012+(i.archetype==="coastal"||i.archetype==="river"?.18:0),.6,1.5),c=Ft(a*l),u=Ft(e.airClimateHazard*.6+i.industryLoad*42-i.transitAccess*14-i.canopyCover*6),h=Ft(i.healthIndex*.5+(100-Th(r))*.18+(100-c)*.12+(100-u)*.16+i.coolingAccess*13+i.equityIndex*.08),d=Ft(100-r*.22-c*.23-u*.17+i.floodDefense*17+i.canopyCover*14+i.transitAccess*8+i.solarCoverage*7);return{uhiDeltaC:Math.round(t*100)/100,runoffCoefficient:Math.round(o*100)/100,heatExposure:Math.round(r),floodExposure:Math.round(c),airPollution:Math.round(u),healthIndex:Math.round(h),resilienceIndex:Math.round(d)}}const Ph=["imperviousness","canopyCover","solarCoverage"],Lh=["transitAccess","floodDefense","coolingAccess","industryLoad"],Dh=["healthIndex","equityIndex","resilienceIndex"],Ih=["emissions","heatRisk","floodRisk","airQualityRisk","publicHealth","equity","publicTrust","biodiversity","energySecurity","educationScore"];function Uh(i){return ui(ku(i))}function qa(i){return i.appliedPolicies.filter(e=>e.turn===i.turn).length}function Sr(i){return Math.max(0,i.mission.policyLimitPerTurn-qa(i))}function Nh(i,e,t=i.selectedDistrictId){if(i.phase==="complete")return i;if(i.mission.status==="briefing")return zi(i,"請先啟動任務，再審議政策。");if(i.mission.status!=="active")return zi(i,"目前任務不在進行中。");const n=$a(e);if(!n)return zi(i,`找不到政策：${e}`);if(Sr(i)<=0)return zi(i,"本回合政策上限已用完。請進入下一年後再審議新的政策。");if(i.budget<n.cost)return zi(i,`預算不足，無法投資「${n.name}」。`);const s=i;let r=Mc(i,n,t);const o=bc(r,n,t),a=ja(s,r);return r={...r,lastResolution:void 0,appliedPolicies:[{turn:r.turn,year:r.year,policyId:n.id,policyName:n.name,targetDistrictId:n.target==="district"?t:void 0,note:`${o}: ${n.evidencePrompt}`},...r.appliedPolicies].slice(0,12),eventLog:[`${r.year}: 已投資「${n.name}」於${o}。`,Sc(a),...r.eventLog].slice(0,10)},Ms(r,{allowCompletion:!1})}function Ya(i,e,t=i.selectedDistrictId){const n=$a(e);if(!n)return;const s=Mc(i,n,t),r=Sr(i),o=i.budget>=n.cost,a=i.mission.status==="active";return{policyId:e,affordable:o&&r>0&&a&&i.phase!=="complete",canAffordBudget:o,missionActive:a,remainingActions:r,targetName:bc(i,n,t),deltas:ja(i,s)}}function Oh(i){if(i.phase==="complete")return i;if(i.mission.status==="briefing")return zi(i,"請先啟動任務，再進入下一年。");const e=i,t=i.currentChallenge;let n=bs(i);for(const[o,a]of Object.entries(t.pressure))n[o]=nt(n[o]+a);n.budget=Ye(n.budget+18+n.publicTrust*.04-n.emissions*.03),n.year+=1,n.turn+=1,n.phase="planning";const s=Ou(n.scenario);n.climateSignals={...n.climateSignals,meanTemperatureC:Ye(n.climateSignals.meanTemperatureC+s.warmingPerYearC,2),temperatureAnomalyC:Ye(n.climateSignals.temperatureAnomalyC+s.warmingPerYearC,2),heatwaveDaysPerSeason:Ye(n.climateSignals.heatwaveDaysPerSeason+s.heatwaveDaysPerYear,1),tropicalNightsPerSeason:Ye(n.climateSignals.tropicalNightsPerSeason+s.tropicalNightsPerYear,1),monthlyPrecipitationMm:Ye(n.climateSignals.monthlyPrecipitationMm+s.monthlyPrecipPerYearMm,1),precipitationAnomalyRatio:Ye(n.climateSignals.precipitationAnomalyRatio+s.precipAnomalyPerYear,2),heavyRainDaysPerSeason:Ye(n.climateSignals.heavyRainDaysPerSeason+s.heavyRainDaysPerYear,1),pm25UgM3:Ye(Math.max(6,n.climateSignals.pm25UgM3+n.airQualityRisk/280-.12),1)},n.currentChallenge=gc(n.seed,n.turn,t.id),n=ui(n);const r={year:n.year,title:t.title,summary:t.body,scienceNote:t.scienceNote,soundCue:t.soundCue,deltas:ja(e,n),objectiveSnapshot:n.mission.objectives};return n={...n,lastResolution:r,eventLog:[`${n.year}: ${t.title}。${t.body}`,`科學提示：${t.scienceNote}`,Sc(r.deltas),...n.eventLog].slice(0,10),evidenceLog:[...zh(e,n),...n.evidenceLog].slice(0,60)},Ms(n,{allowCompletion:!0})}function Fh(i,e){let t=bs(i);return t.climateSignals=e,t.eventLog=["已載入 Open-Meteo（含空氣品質 CAMS）/ NASA POWER 的最新可用資料與官方人口統計。",...t.eventLog].slice(0,10),t=ui(t),Ms(t,{allowCompletion:!1})}function ui(i){let e=bs(i);e.districts=e.districts.map(a=>Bh(a,e.climateSignals));const t=yc(e.climateSignals);e.heatRisk=Ye(_n(e.districts,a=>a.heatExposure,a=>a.population)),e.floodRisk=Ye(_n(e.districts,a=>a.floodExposure,a=>a.population)),e.airQualityRisk=Ye(_n(e.districts,a=>a.airPollution,a=>a.population)),e.publicHealth=Ye(_n(e.districts,a=>a.healthIndex,a=>a.population)),e.equity=Ye(_n(e.districts,a=>a.equityIndex,a=>a.population));const n=_n(e.districts,a=>a.transitAccess,a=>a.population),s=_n(e.districts,a=>a.solarCoverage,a=>a.population),r=_n(e.districts,a=>a.canopyCover,a=>a.population),o=_n(e.districts,a=>a.industryLoad,a=>a.population);e.emissions=nt(Ye(e.emissions+o*1.5-s*4.2-n*1.8+e.heatRisk*.01)),e.biodiversity=nt(Ye(e.biodiversity+r*4-e.floodRisk*.02)),e.energySecurity=nt(Ye(e.energySecurity+s*6+t.solarOpportunity*.04-e.heatRisk*.025)),e.sdgScore=Ye(.17*e.publicHealth+.14*e.equity+.12*e.publicTrust+.12*e.energySecurity+.12*e.biodiversity+.11*(100-e.heatRisk)+.1*(100-e.floodRisk)+.08*(100-e.airQualityRisk)+.04*e.educationScore);for(const a of Ih)e[a]=nt(e[a]);return e=Ms(e,{allowCompletion:!1}),e}function Mc(i,e,t){const n=bs(i);if(n.budget=Ye(n.budget-e.cost),e.cityEffects)for(const[s,r]of Object.entries(e.cityEffects))n[s]=nt(n[s]+r);if(e.target==="district"){const s=n.districts.find(r=>r.id===t)??n.districts[0];if(e.districtEffects)for(const[r,o]of Object.entries(e.districtEffects))Ph.includes(r)?s.cells=Uu(s.cells,r,o,n.seed+n.turn*101):Lh.includes(r)&&(s[r]=Ca(s[r]+o)),Dh.includes(r)&&(s[r]=nt(s[r]+o))}return ui(n)}function Bh(i,e){const t=Lu(i.cells),n={...i,imperviousness:t.imperviousness,canopyCover:t.canopyCover,solarCoverage:t.solarCoverage,floodDefense:Ca(i.floodDefense+t.floodDefenseBonus),coolingAccess:Ca(i.coolingAccess+t.coolingAccessBonus)},s=yc(e),r=Rh(n,s);return{...i,imperviousness:t.imperviousness,canopyCover:t.canopyCover,solarCoverage:t.solarCoverage,heatExposure:r.heatExposure,floodExposure:r.floodExposure,airPollution:r.airPollution,healthIndex:r.healthIndex,resilienceIndex:r.resilienceIndex,uhiDeltaC:r.uhiDeltaC,runoffCoefficient:r.runoffCoefficient}}function ja(i,e){return{budget:Ye(e.budget-i.budget),sdgScore:Ye(e.sdgScore-i.sdgScore),heatRisk:Ye(e.heatRisk-i.heatRisk),floodRisk:Ye(e.floodRisk-i.floodRisk),airQualityRisk:Ye(e.airQualityRisk-i.airQualityRisk),publicHealth:Ye(e.publicHealth-i.publicHealth),equity:Ye(e.equity-i.equity)}}function Sc(i){const e=Rs(i.heatRisk??0),t=Rs(i.publicHealth??0),n=Rs(i.equity??0),s=Rs(i.sdgScore??0);return`影響摘要：熱風險 ${e}、公共健康 ${t}、公平性 ${n}、SDGs 綜合分數 ${s}。`}function Rs(i){return i>0?`+${Ye(i,1)}`:String(Ye(i,1))}function zh(i,e){const t=e.districts.find(r=>r.id===e.selectedDistrictId)??e.districts[0],n=Ye(e.heatRisk-i.heatRisk,1),s=Ye(e.publicHealth-i.publicHealth,1);return[{turn:e.turn,year:e.year,kind:"climate",label:"暖季均溫 / 熱夜",value:`${e.climateSignals.meanTemperatureC}°C / ${e.climateSignals.tropicalNightsPerSeason} 夜`,source:`SSP 情境（${e.scenario.toUpperCase()}）+ Open-Meteo / NASA POWER 基準`},{turn:e.turn,year:e.year,kind:"district",label:`${t.name} UHI ΔT / 逕流係數`,value:`${t.uhiDeltaC??"—"}°C / ${t.runoffCoefficient??"—"}`,source:"Ziter et al. 2019 PNAS（UHI 靈敏度）、合理化公式（逕流）"},{turn:e.turn,year:e.year,kind:"policy",label:"本年度城市指標變化",value:`熱風險 ${n>=0?"+":""}${n}、公共健康 ${s>=0?"+":""}${s}`,source:"模擬引擎（IPCC AR6 Hazard×Exposure×Vulnerability）"}]}function bc(i,e,t){var n;return e.target==="city"?"全城市":((n=i.districts.find(s=>s.id===t))==null?void 0:n.name)??"未知街區"}function zi(i,e){const t=bs(i);return t.eventLog=[e,...t.eventLog].slice(0,10),t}function bs(i){return{...i,currentChallenge:{...i.currentChallenge,pressure:{...i.currentChallenge.pressure}},mission:{...i.mission,objectives:i.mission.objectives.map(e=>({...e}))},lastResolution:i.lastResolution?{...i.lastResolution,deltas:{...i.lastResolution.deltas},objectiveSnapshot:i.lastResolution.objectiveSnapshot.map(e=>({...e}))}:void 0,climateSignals:{...i.climateSignals},districts:i.districts.map(e=>({...e,cells:[...e.cells]})),appliedPolicies:i.appliedPolicies.map(e=>({...e})),eventLog:[...i.eventLog],evidenceLog:i.evidenceLog.map(e=>({...e}))}}/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Ka="165",mi={ROTATE:0,DOLLY:1,PAN:2},gi={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},kh=0,bo=1,Hh=2,Ec=1,Tc=2,bn=3,Gn=0,Dt=1,$t=2,An=0,Gi=1,Et=2,Eo=3,To=4,Gh=5,ni=100,Vh=101,Wh=102,Xh=103,$h=104,qh=200,Yh=201,jh=202,Kh=203,Da=204,Ia=205,Zh=206,Jh=207,Qh=208,ed=209,td=210,nd=211,id=212,sd=213,rd=214,ad=0,od=1,ld=2,ur=3,cd=4,ud=5,hd=6,dd=7,wc=0,fd=1,pd=2,kn=0,Ac=1,Cc=2,Rc=3,Za=4,md=5,Pc=6,Lc=7,Dc=300,Xi=301,$i=302,Ua=303,Na=304,br=306,xs=1e3,si=1001,Oa=1002,Bt=1003,gd=1004,Ps=1005,rn=1006,Or=1007,ri=1008,Vn=1009,_d=1010,vd=1011,hr=1012,Ic=1013,qi=1014,Tn=1015,Hn=1016,Uc=1017,Nc=1018,Yi=1020,xd=35902,yd=1021,Md=1022,pn=1023,Sd=1024,bd=1025,Vi=1026,ji=1027,Oc=1028,Fc=1029,Ed=1030,Bc=1031,zc=1033,Fr=33776,Br=33777,zr=33778,kr=33779,wo=35840,Ao=35841,Co=35842,Ro=35843,Po=36196,Lo=37492,Do=37496,Io=37808,Uo=37809,No=37810,Oo=37811,Fo=37812,Bo=37813,zo=37814,ko=37815,Ho=37816,Go=37817,Vo=37818,Wo=37819,Xo=37820,$o=37821,Hr=36492,qo=36494,Yo=36495,Td=36283,jo=36284,Ko=36285,Zo=36286,wd=3200,Ad=3201,kc=0,Cd=1,Bn="",Kt="srgb",Wn="srgb-linear",Ja="display-p3",Er="display-p3-linear",dr="linear",st="srgb",fr="rec709",pr="p3",_i=7680,Jo=519,Rd=512,Pd=513,Ld=514,Hc=515,Dd=516,Id=517,Ud=518,Nd=519,Qo=35044,el="300 es",wn=2e3,mr=2001;class hi{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const s=this._listeners[e];if(s!==void 0){const r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const n=this._listeners[e.type];if(n!==void 0){e.target=this;const s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}}const Rt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],or=Math.PI/180,Fa=180/Math.PI;function Es(){const i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Rt[i&255]+Rt[i>>8&255]+Rt[i>>16&255]+Rt[i>>24&255]+"-"+Rt[e&255]+Rt[e>>8&255]+"-"+Rt[e>>16&15|64]+Rt[e>>24&255]+"-"+Rt[t&63|128]+Rt[t>>8&255]+"-"+Rt[t>>16&255]+Rt[t>>24&255]+Rt[n&255]+Rt[n>>8&255]+Rt[n>>16&255]+Rt[n>>24&255]).toLowerCase()}function At(i,e,t){return Math.max(e,Math.min(t,i))}function Od(i,e){return(i%e+e)%e}function Gr(i,e,t){return(1-t)*i+t*e}function es(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function Ot(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}const Fd={DEG2RAD:or};class ie{constructor(e=0,t=0){ie.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(At(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*n-o*s+e.x,this.y=r*s+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Ne{constructor(e,t,n,s,r,o,a,l,c){Ne.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,l,c)}set(e,t,n,s,r,o,a,l,c){const u=this.elements;return u[0]=e,u[1]=s,u[2]=a,u[3]=t,u[4]=r,u[5]=l,u[6]=n,u[7]=o,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],u=n[4],h=n[7],d=n[2],f=n[5],g=n[8],v=s[0],m=s[3],p=s[6],E=s[1],y=s[4],T=s[7],D=s[2],R=s[5],w=s[8];return r[0]=o*v+a*E+l*D,r[3]=o*m+a*y+l*R,r[6]=o*p+a*T+l*w,r[1]=c*v+u*E+h*D,r[4]=c*m+u*y+h*R,r[7]=c*p+u*T+h*w,r[2]=d*v+f*E+g*D,r[5]=d*m+f*y+g*R,r[8]=d*p+f*T+g*w,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8];return t*o*u-t*a*c-n*r*u+n*a*l+s*r*c-s*o*l}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],h=u*o-a*c,d=a*l-u*r,f=c*r-o*l,g=t*h+n*d+s*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const v=1/g;return e[0]=h*v,e[1]=(s*c-u*n)*v,e[2]=(a*n-s*o)*v,e[3]=d*v,e[4]=(u*t-s*l)*v,e[5]=(s*r-a*t)*v,e[6]=f*v,e[7]=(n*l-c*t)*v,e[8]=(o*t-n*r)*v,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,o,a){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+e,-s*c,s*l,-s*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(Vr.makeScale(e,t)),this}rotate(e){return this.premultiply(Vr.makeRotation(-e)),this}translate(e,t){return this.premultiply(Vr.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Vr=new Ne;function Gc(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function gr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Bd(){const i=gr("canvas");return i.style.display="block",i}const tl={};function Vc(i){i in tl||(tl[i]=!0,console.warn(i))}function zd(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}const nl=new Ne().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),il=new Ne().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),Ls={[Wn]:{transfer:dr,primaries:fr,toReference:i=>i,fromReference:i=>i},[Kt]:{transfer:st,primaries:fr,toReference:i=>i.convertSRGBToLinear(),fromReference:i=>i.convertLinearToSRGB()},[Er]:{transfer:dr,primaries:pr,toReference:i=>i.applyMatrix3(il),fromReference:i=>i.applyMatrix3(nl)},[Ja]:{transfer:st,primaries:pr,toReference:i=>i.convertSRGBToLinear().applyMatrix3(il),fromReference:i=>i.applyMatrix3(nl).convertLinearToSRGB()}},kd=new Set([Wn,Er]),Ze={enabled:!0,_workingColorSpace:Wn,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(i){if(!kd.has(i))throw new Error(`Unsupported working color space, "${i}".`);this._workingColorSpace=i},convert:function(i,e,t){if(this.enabled===!1||e===t||!e||!t)return i;const n=Ls[e].toReference,s=Ls[t].fromReference;return s(n(i))},fromWorkingColorSpace:function(i,e){return this.convert(i,this._workingColorSpace,e)},toWorkingColorSpace:function(i,e){return this.convert(i,e,this._workingColorSpace)},getPrimaries:function(i){return Ls[i].primaries},getTransfer:function(i){return i===Bn?dr:Ls[i].transfer}};function Wi(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Wr(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let vi;class Hd{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{vi===void 0&&(vi=gr("canvas")),vi.width=e.width,vi.height=e.height;const n=vi.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=vi}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=gr("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=Wi(r[o]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Wi(t[n]/255)*255):t[n]=Wi(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let Gd=0;class Wc{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Gd++}),this.uuid=Es(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(Xr(s[o].image)):r.push(Xr(s[o]))}else r=Xr(s);n.url=r}return t||(e.images[this.uuid]=n),n}}function Xr(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Hd.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let Vd=0;class It extends hi{constructor(e=It.DEFAULT_IMAGE,t=It.DEFAULT_MAPPING,n=si,s=si,r=rn,o=ri,a=pn,l=Vn,c=It.DEFAULT_ANISOTROPY,u=Bn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Vd++}),this.uuid=Es(),this.name="",this.source=new Wc(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new ie(0,0),this.repeat=new ie(1,1),this.center=new ie(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ne,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Dc)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case xs:e.x=e.x-Math.floor(e.x);break;case si:e.x=e.x<0?0:1;break;case Oa:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case xs:e.y=e.y-Math.floor(e.y);break;case si:e.y=e.y<0?0:1;break;case Oa:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}It.DEFAULT_IMAGE=null;It.DEFAULT_MAPPING=Dc;It.DEFAULT_ANISOTROPY=1;class rt{constructor(e=0,t=0,n=0,s=1){rt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*n+o[11]*s+o[15]*r,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r;const l=e.elements,c=l[0],u=l[4],h=l[8],d=l[1],f=l[5],g=l[9],v=l[2],m=l[6],p=l[10];if(Math.abs(u-d)<.01&&Math.abs(h-v)<.01&&Math.abs(g-m)<.01){if(Math.abs(u+d)<.1&&Math.abs(h+v)<.1&&Math.abs(g+m)<.1&&Math.abs(c+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const y=(c+1)/2,T=(f+1)/2,D=(p+1)/2,R=(u+d)/4,w=(h+v)/4,U=(g+m)/4;return y>T&&y>D?y<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(y),s=R/n,r=w/n):T>D?T<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(T),n=R/s,r=U/s):D<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(D),n=w/r,s=U/r),this.set(n,s,r,t),this}let E=Math.sqrt((m-g)*(m-g)+(h-v)*(h-v)+(d-u)*(d-u));return Math.abs(E)<.001&&(E=1),this.x=(m-g)/E,this.y=(h-v)/E,this.z=(d-u)/E,this.w=Math.acos((c+f+p-1)/2),this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Wd extends hi{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new rt(0,0,e,t),this.scissorTest=!1,this.viewport=new rt(0,0,e,t);const s={width:e,height:t,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:rn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);const r=new It(s,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);r.flipY=!1,r.generateMipmaps=n.generateMipmaps,r.internalFormat=n.internalFormat,this.textures=[];const o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let n=0,s=e.textures.length;n<s;n++)this.textures[n]=e.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new Wc(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class an extends Wd{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class Xc extends It{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Bt,this.minFilter=Bt,this.wrapR=si,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class Xd extends It{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Bt,this.minFilter=Bt,this.wrapR=si,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class ci{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,o,a){let l=n[s+0],c=n[s+1],u=n[s+2],h=n[s+3];const d=r[o+0],f=r[o+1],g=r[o+2],v=r[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h;return}if(a===1){e[t+0]=d,e[t+1]=f,e[t+2]=g,e[t+3]=v;return}if(h!==v||l!==d||c!==f||u!==g){let m=1-a;const p=l*d+c*f+u*g+h*v,E=p>=0?1:-1,y=1-p*p;if(y>Number.EPSILON){const D=Math.sqrt(y),R=Math.atan2(D,p*E);m=Math.sin(m*R)/D,a=Math.sin(a*R)/D}const T=a*E;if(l=l*m+d*T,c=c*m+f*T,u=u*m+g*T,h=h*m+v*T,m===1-a){const D=1/Math.sqrt(l*l+c*c+u*u+h*h);l*=D,c*=D,u*=D,h*=D}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h}static multiplyQuaternionsFlat(e,t,n,s,r,o){const a=n[s],l=n[s+1],c=n[s+2],u=n[s+3],h=r[o],d=r[o+1],f=r[o+2],g=r[o+3];return e[t]=a*g+u*h+l*f-c*d,e[t+1]=l*g+u*d+c*h-a*f,e[t+2]=c*g+u*f+a*d-l*h,e[t+3]=u*g-a*h-l*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(n/2),u=a(s/2),h=a(r/2),d=l(n/2),f=l(s/2),g=l(r/2);switch(o){case"XYZ":this._x=d*u*h+c*f*g,this._y=c*f*h-d*u*g,this._z=c*u*g+d*f*h,this._w=c*u*h-d*f*g;break;case"YXZ":this._x=d*u*h+c*f*g,this._y=c*f*h-d*u*g,this._z=c*u*g-d*f*h,this._w=c*u*h+d*f*g;break;case"ZXY":this._x=d*u*h-c*f*g,this._y=c*f*h+d*u*g,this._z=c*u*g+d*f*h,this._w=c*u*h-d*f*g;break;case"ZYX":this._x=d*u*h-c*f*g,this._y=c*f*h+d*u*g,this._z=c*u*g-d*f*h,this._w=c*u*h+d*f*g;break;case"YZX":this._x=d*u*h+c*f*g,this._y=c*f*h+d*u*g,this._z=c*u*g-d*f*h,this._w=c*u*h-d*f*g;break;case"XZY":this._x=d*u*h-c*f*g,this._y=c*f*h-d*u*g,this._z=c*u*g+d*f*h,this._w=c*u*h+d*f*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],s=t[4],r=t[8],o=t[1],a=t[5],l=t[9],c=t[2],u=t[6],h=t[10],d=n+a+h;if(d>0){const f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(u-l)*f,this._y=(r-c)*f,this._z=(o-s)*f}else if(n>a&&n>h){const f=2*Math.sqrt(1+n-a-h);this._w=(u-l)/f,this._x=.25*f,this._y=(s+o)/f,this._z=(r+c)/f}else if(a>h){const f=2*Math.sqrt(1+a-n-h);this._w=(r-c)/f,this._x=(s+o)/f,this._y=.25*f,this._z=(l+u)/f}else{const f=2*Math.sqrt(1+h-n-a);this._w=(o-s)/f,this._x=(r+c)/f,this._y=(l+u)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(At(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,s=e._y,r=e._z,o=e._w,a=t._x,l=t._y,c=t._z,u=t._w;return this._x=n*u+o*a+s*c-r*l,this._y=s*u+o*l+r*a-n*c,this._z=r*u+o*c+n*l-s*a,this._w=o*u-n*a-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,s=this._y,r=this._z,o=this._w;let a=o*e._w+n*e._x+s*e._y+r*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=n,this._y=s,this._z=r,this;const l=1-a*a;if(l<=Number.EPSILON){const f=1-t;return this._w=f*o+t*this._w,this._x=f*n+t*this._x,this._y=f*s+t*this._y,this._z=f*r+t*this._z,this.normalize(),this}const c=Math.sqrt(l),u=Math.atan2(c,a),h=Math.sin((1-t)*u)/c,d=Math.sin(t*u)/c;return this._w=o*h+this._w*d,this._x=n*h+this._x*d,this._y=s*h+this._y*d,this._z=r*h+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class C{constructor(e=0,t=0,n=0){C.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(sl.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(sl.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(e){const t=this.x,n=this.y,s=this.z,r=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*s-a*n),u=2*(a*t-r*s),h=2*(r*n-o*t);return this.x=t+l*c+o*h-a*u,this.y=n+l*u+a*c-r*h,this.z=s+l*h+r*u-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,s=e.y,r=e.z,o=t.x,a=t.y,l=t.z;return this.x=s*l-r*a,this.y=r*o-n*l,this.z=n*a-s*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return $r.copy(this).projectOnVector(e),this.sub($r)}reflect(e){return this.sub($r.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(At(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const $r=new C,sl=new ci;class di{constructor(e=new C(1/0,1/0,1/0),t=new C(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(en.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(en.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=en.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,en):en.fromBufferAttribute(r,o),en.applyMatrix4(e.matrixWorld),this.expandByPoint(en);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Ds.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Ds.copy(n.boundingBox)),Ds.applyMatrix4(e.matrixWorld),this.union(Ds)}const s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return!(e.x<this.min.x||e.x>this.max.x||e.y<this.min.y||e.y>this.max.y||e.z<this.min.z||e.z>this.max.z)}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return!(e.max.x<this.min.x||e.min.x>this.max.x||e.max.y<this.min.y||e.min.y>this.max.y||e.max.z<this.min.z||e.min.z>this.max.z)}intersectsSphere(e){return this.clampPoint(e.center,en),en.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(ts),Is.subVectors(this.max,ts),xi.subVectors(e.a,ts),yi.subVectors(e.b,ts),Mi.subVectors(e.c,ts),Ln.subVectors(yi,xi),Dn.subVectors(Mi,yi),jn.subVectors(xi,Mi);let t=[0,-Ln.z,Ln.y,0,-Dn.z,Dn.y,0,-jn.z,jn.y,Ln.z,0,-Ln.x,Dn.z,0,-Dn.x,jn.z,0,-jn.x,-Ln.y,Ln.x,0,-Dn.y,Dn.x,0,-jn.y,jn.x,0];return!qr(t,xi,yi,Mi,Is)||(t=[1,0,0,0,1,0,0,0,1],!qr(t,xi,yi,Mi,Is))?!1:(Us.crossVectors(Ln,Dn),t=[Us.x,Us.y,Us.z],qr(t,xi,yi,Mi,Is))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,en).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(en).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(vn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),vn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),vn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),vn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),vn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),vn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),vn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),vn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(vn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const vn=[new C,new C,new C,new C,new C,new C,new C,new C],en=new C,Ds=new di,xi=new C,yi=new C,Mi=new C,Ln=new C,Dn=new C,jn=new C,ts=new C,Is=new C,Us=new C,Kn=new C;function qr(i,e,t,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){Kn.fromArray(i,r);const a=s.x*Math.abs(Kn.x)+s.y*Math.abs(Kn.y)+s.z*Math.abs(Kn.z),l=e.dot(Kn),c=t.dot(Kn),u=n.dot(Kn);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>a)return!1}return!0}const $d=new di,ns=new C,Yr=new C;class fi{constructor(e=new C,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):$d.setFromPoints(e).getCenter(n);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;ns.subVectors(e,this.center);const t=ns.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(ns,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Yr.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(ns.copy(e.center).add(Yr)),this.expandByPoint(ns.copy(e.center).sub(Yr))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const xn=new C,jr=new C,Ns=new C,In=new C,Kr=new C,Os=new C,Zr=new C;class Ts{constructor(e=new C,t=new C(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,xn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=xn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(xn.copy(this.origin).addScaledVector(this.direction,t),xn.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){jr.copy(e).add(t).multiplyScalar(.5),Ns.copy(t).sub(e).normalize(),In.copy(this.origin).sub(jr);const r=e.distanceTo(t)*.5,o=-this.direction.dot(Ns),a=In.dot(this.direction),l=-In.dot(Ns),c=In.lengthSq(),u=Math.abs(1-o*o);let h,d,f,g;if(u>0)if(h=o*l-a,d=o*a-l,g=r*u,h>=0)if(d>=-g)if(d<=g){const v=1/u;h*=v,d*=v,f=h*(h+o*d+2*a)+d*(o*h+d+2*l)+c}else d=r,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*l)+c;else d=-r,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*l)+c;else d<=-g?(h=Math.max(0,-(-o*r+a)),d=h>0?-r:Math.min(Math.max(-r,-l),r),f=-h*h+d*(d+2*l)+c):d<=g?(h=0,d=Math.min(Math.max(-r,-l),r),f=d*(d+2*l)+c):(h=Math.max(0,-(o*r+a)),d=h>0?r:Math.min(Math.max(-r,-l),r),f=-h*h+d*(d+2*l)+c);else d=o>0?-r:r,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,h),s&&s.copy(jr).addScaledVector(Ns,d),f}intersectSphere(e,t){xn.subVectors(e.center,this.origin);const n=xn.dot(this.direction),s=xn.dot(xn)-n*n,r=e.radius*e.radius;if(s>r)return null;const o=Math.sqrt(r-s),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,o,a,l;const c=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,s=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,s=(e.min.x-d.x)*c),u>=0?(r=(e.min.y-d.y)*u,o=(e.max.y-d.y)*u):(r=(e.max.y-d.y)*u,o=(e.min.y-d.y)*u),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),h>=0?(a=(e.min.z-d.z)*h,l=(e.max.z-d.z)*h):(a=(e.max.z-d.z)*h,l=(e.min.z-d.z)*h),n>l||a>s)||((a>n||n!==n)&&(n=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,xn)!==null}intersectTriangle(e,t,n,s,r){Kr.subVectors(t,e),Os.subVectors(n,e),Zr.crossVectors(Kr,Os);let o=this.direction.dot(Zr),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;In.subVectors(this.origin,e);const l=a*this.direction.dot(Os.crossVectors(In,Os));if(l<0)return null;const c=a*this.direction.dot(Kr.cross(In));if(c<0||l+c>o)return null;const u=-a*In.dot(Zr);return u<0?null:this.at(u/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class et{constructor(e,t,n,s,r,o,a,l,c,u,h,d,f,g,v,m){et.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,l,c,u,h,d,f,g,v,m)}set(e,t,n,s,r,o,a,l,c,u,h,d,f,g,v,m){const p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=s,p[1]=r,p[5]=o,p[9]=a,p[13]=l,p[2]=c,p[6]=u,p[10]=h,p[14]=d,p[3]=f,p[7]=g,p[11]=v,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new et().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,s=1/Si.setFromMatrixColumn(e,0).length(),r=1/Si.setFromMatrixColumn(e,1).length(),o=1/Si.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,s=e.y,r=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(s),c=Math.sin(s),u=Math.cos(r),h=Math.sin(r);if(e.order==="XYZ"){const d=o*u,f=o*h,g=a*u,v=a*h;t[0]=l*u,t[4]=-l*h,t[8]=c,t[1]=f+g*c,t[5]=d-v*c,t[9]=-a*l,t[2]=v-d*c,t[6]=g+f*c,t[10]=o*l}else if(e.order==="YXZ"){const d=l*u,f=l*h,g=c*u,v=c*h;t[0]=d+v*a,t[4]=g*a-f,t[8]=o*c,t[1]=o*h,t[5]=o*u,t[9]=-a,t[2]=f*a-g,t[6]=v+d*a,t[10]=o*l}else if(e.order==="ZXY"){const d=l*u,f=l*h,g=c*u,v=c*h;t[0]=d-v*a,t[4]=-o*h,t[8]=g+f*a,t[1]=f+g*a,t[5]=o*u,t[9]=v-d*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){const d=o*u,f=o*h,g=a*u,v=a*h;t[0]=l*u,t[4]=g*c-f,t[8]=d*c+v,t[1]=l*h,t[5]=v*c+d,t[9]=f*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){const d=o*l,f=o*c,g=a*l,v=a*c;t[0]=l*u,t[4]=v-d*h,t[8]=g*h+f,t[1]=h,t[5]=o*u,t[9]=-a*u,t[2]=-c*u,t[6]=f*h+g,t[10]=d-v*h}else if(e.order==="XZY"){const d=o*l,f=o*c,g=a*l,v=a*c;t[0]=l*u,t[4]=-h,t[8]=c*u,t[1]=d*h+v,t[5]=o*u,t[9]=f*h-g,t[2]=g*h-f,t[6]=a*u,t[10]=v*h+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(qd,e,Yd)}lookAt(e,t,n){const s=this.elements;return Gt.subVectors(e,t),Gt.lengthSq()===0&&(Gt.z=1),Gt.normalize(),Un.crossVectors(n,Gt),Un.lengthSq()===0&&(Math.abs(n.z)===1?Gt.x+=1e-4:Gt.z+=1e-4,Gt.normalize(),Un.crossVectors(n,Gt)),Un.normalize(),Fs.crossVectors(Gt,Un),s[0]=Un.x,s[4]=Fs.x,s[8]=Gt.x,s[1]=Un.y,s[5]=Fs.y,s[9]=Gt.y,s[2]=Un.z,s[6]=Fs.z,s[10]=Gt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],u=n[1],h=n[5],d=n[9],f=n[13],g=n[2],v=n[6],m=n[10],p=n[14],E=n[3],y=n[7],T=n[11],D=n[15],R=s[0],w=s[4],U=s[8],b=s[12],M=s[1],P=s[5],k=s[9],B=s[13],$=s[2],Y=s[6],W=s[10],j=s[14],X=s[3],ue=s[7],he=s[11],pe=s[15];return r[0]=o*R+a*M+l*$+c*X,r[4]=o*w+a*P+l*Y+c*ue,r[8]=o*U+a*k+l*W+c*he,r[12]=o*b+a*B+l*j+c*pe,r[1]=u*R+h*M+d*$+f*X,r[5]=u*w+h*P+d*Y+f*ue,r[9]=u*U+h*k+d*W+f*he,r[13]=u*b+h*B+d*j+f*pe,r[2]=g*R+v*M+m*$+p*X,r[6]=g*w+v*P+m*Y+p*ue,r[10]=g*U+v*k+m*W+p*he,r[14]=g*b+v*B+m*j+p*pe,r[3]=E*R+y*M+T*$+D*X,r[7]=E*w+y*P+T*Y+D*ue,r[11]=E*U+y*k+T*W+D*he,r[15]=E*b+y*B+T*j+D*pe,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],o=e[1],a=e[5],l=e[9],c=e[13],u=e[2],h=e[6],d=e[10],f=e[14],g=e[3],v=e[7],m=e[11],p=e[15];return g*(+r*l*h-s*c*h-r*a*d+n*c*d+s*a*f-n*l*f)+v*(+t*l*f-t*c*d+r*o*d-s*o*f+s*c*u-r*l*u)+m*(+t*c*h-t*a*f-r*o*h+n*o*f+r*a*u-n*c*u)+p*(-s*a*u-t*l*h+t*a*d+s*o*h-n*o*d+n*l*u)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],h=e[9],d=e[10],f=e[11],g=e[12],v=e[13],m=e[14],p=e[15],E=h*m*c-v*d*c+v*l*f-a*m*f-h*l*p+a*d*p,y=g*d*c-u*m*c-g*l*f+o*m*f+u*l*p-o*d*p,T=u*v*c-g*h*c+g*a*f-o*v*f-u*a*p+o*h*p,D=g*h*l-u*v*l-g*a*d+o*v*d+u*a*m-o*h*m,R=t*E+n*y+s*T+r*D;if(R===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const w=1/R;return e[0]=E*w,e[1]=(v*d*r-h*m*r-v*s*f+n*m*f+h*s*p-n*d*p)*w,e[2]=(a*m*r-v*l*r+v*s*c-n*m*c-a*s*p+n*l*p)*w,e[3]=(h*l*r-a*d*r-h*s*c+n*d*c+a*s*f-n*l*f)*w,e[4]=y*w,e[5]=(u*m*r-g*d*r+g*s*f-t*m*f-u*s*p+t*d*p)*w,e[6]=(g*l*r-o*m*r-g*s*c+t*m*c+o*s*p-t*l*p)*w,e[7]=(o*d*r-u*l*r+u*s*c-t*d*c-o*s*f+t*l*f)*w,e[8]=T*w,e[9]=(g*h*r-u*v*r-g*n*f+t*v*f+u*n*p-t*h*p)*w,e[10]=(o*v*r-g*a*r+g*n*c-t*v*c-o*n*p+t*a*p)*w,e[11]=(u*a*r-o*h*r-u*n*c+t*h*c+o*n*f-t*a*f)*w,e[12]=D*w,e[13]=(u*v*s-g*h*s+g*n*d-t*v*d-u*n*m+t*h*m)*w,e[14]=(g*a*s-o*v*s-g*n*l+t*v*l+o*n*m-t*a*m)*w,e[15]=(o*h*s-u*a*s+u*n*l-t*h*l-o*n*d+t*a*d)*w,this}scale(e){const t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),s=Math.sin(t),r=1-n,o=e.x,a=e.y,l=e.z,c=r*o,u=r*a;return this.set(c*o+n,c*a-s*l,c*l+s*a,0,c*a+s*l,u*a+n,u*l-s*o,0,c*l-s*a,u*l+s*o,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,o){return this.set(1,n,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){const s=this.elements,r=t._x,o=t._y,a=t._z,l=t._w,c=r+r,u=o+o,h=a+a,d=r*c,f=r*u,g=r*h,v=o*u,m=o*h,p=a*h,E=l*c,y=l*u,T=l*h,D=n.x,R=n.y,w=n.z;return s[0]=(1-(v+p))*D,s[1]=(f+T)*D,s[2]=(g-y)*D,s[3]=0,s[4]=(f-T)*R,s[5]=(1-(d+p))*R,s[6]=(m+E)*R,s[7]=0,s[8]=(g+y)*w,s[9]=(m-E)*w,s[10]=(1-(d+v))*w,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){const s=this.elements;let r=Si.set(s[0],s[1],s[2]).length();const o=Si.set(s[4],s[5],s[6]).length(),a=Si.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],tn.copy(this);const c=1/r,u=1/o,h=1/a;return tn.elements[0]*=c,tn.elements[1]*=c,tn.elements[2]*=c,tn.elements[4]*=u,tn.elements[5]*=u,tn.elements[6]*=u,tn.elements[8]*=h,tn.elements[9]*=h,tn.elements[10]*=h,t.setFromRotationMatrix(tn),n.x=r,n.y=o,n.z=a,this}makePerspective(e,t,n,s,r,o,a=wn){const l=this.elements,c=2*r/(t-e),u=2*r/(n-s),h=(t+e)/(t-e),d=(n+s)/(n-s);let f,g;if(a===wn)f=-(o+r)/(o-r),g=-2*o*r/(o-r);else if(a===mr)f=-o/(o-r),g=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=h,l[12]=0,l[1]=0,l[5]=u,l[9]=d,l[13]=0,l[2]=0,l[6]=0,l[10]=f,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,s,r,o,a=wn){const l=this.elements,c=1/(t-e),u=1/(n-s),h=1/(o-r),d=(t+e)*c,f=(n+s)*u;let g,v;if(a===wn)g=(o+r)*h,v=-2*h;else if(a===mr)g=r*h,v=-1*h;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-d,l[1]=0,l[5]=2*u,l[9]=0,l[13]=-f,l[2]=0,l[6]=0,l[10]=v,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const Si=new C,tn=new et,qd=new C(0,0,0),Yd=new C(1,1,1),Un=new C,Fs=new C,Gt=new C,rl=new et,al=new ci;class mn{constructor(e=0,t=0,n=0,s=mn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const s=e.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],u=s[9],h=s[2],d=s[6],f=s[10];switch(t){case"XYZ":this._y=Math.asin(At(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-At(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,r),this._z=0);break;case"ZXY":this._x=Math.asin(At(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-h,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-At(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(At(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-h,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-At(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-u,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return rl.makeRotationFromQuaternion(e),this.setFromRotationMatrix(rl,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return al.setFromEuler(this),this.setFromQuaternion(al,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}mn.DEFAULT_ORDER="XYZ";class Qa{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let jd=0;const ol=new C,bi=new ci,yn=new et,Bs=new C,is=new C,Kd=new C,Zd=new ci,ll=new C(1,0,0),cl=new C(0,1,0),ul=new C(0,0,1),hl={type:"added"},Jd={type:"removed"},Ei={type:"childadded",child:null},Jr={type:"childremoved",child:null};class dt extends hi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:jd++}),this.uuid=Es(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=dt.DEFAULT_UP.clone();const e=new C,t=new mn,n=new ci,s=new C(1,1,1);function r(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new et},normalMatrix:{value:new Ne}}),this.matrix=new et,this.matrixWorld=new et,this.matrixAutoUpdate=dt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=dt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Qa,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return bi.setFromAxisAngle(e,t),this.quaternion.multiply(bi),this}rotateOnWorldAxis(e,t){return bi.setFromAxisAngle(e,t),this.quaternion.premultiply(bi),this}rotateX(e){return this.rotateOnAxis(ll,e)}rotateY(e){return this.rotateOnAxis(cl,e)}rotateZ(e){return this.rotateOnAxis(ul,e)}translateOnAxis(e,t){return ol.copy(e).applyQuaternion(this.quaternion),this.position.add(ol.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(ll,e)}translateY(e){return this.translateOnAxis(cl,e)}translateZ(e){return this.translateOnAxis(ul,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(yn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Bs.copy(e):Bs.set(e,t,n);const s=this.parent;this.updateWorldMatrix(!0,!1),is.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?yn.lookAt(is,Bs,this.up):yn.lookAt(Bs,is,this.up),this.quaternion.setFromRotationMatrix(yn),s&&(yn.extractRotation(s.matrixWorld),bi.setFromRotationMatrix(yn),this.quaternion.premultiply(bi.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(hl),Ei.child=e,this.dispatchEvent(Ei),Ei.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Jd),Jr.child=e,this.dispatchEvent(Jr),Jr.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),yn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),yn.multiply(e.parent.matrixWorld)),e.applyMatrix4(yn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(hl),Ei.child=e,this.dispatchEvent(Ei),Ei.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){const o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(is,e,Kd),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(is,Zd,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,s=t.length;n<s;n++){const r=t[n];(r.matrixWorldAutoUpdate===!0||e===!0)&&r.updateMatrixWorld(e)}}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.matrixWorldAutoUpdate===!0&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),t===!0){const s=this.children;for(let r=0,o=s.length;r<o;r++){const a=s[r];a.matrixWorldAutoUpdate===!0&&a.updateWorldMatrix(!1,!0)}}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),s.maxGeometryCount=this._maxGeometryCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){const h=l[c];r(e.shapes,h)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(e.materials,this.material[l]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];s.animations.push(r(e.animations,l))}}if(t){const a=o(e.geometries),l=o(e.materials),c=o(e.textures),u=o(e.images),h=o(e.shapes),d=o(e.skeletons),f=o(e.animations),g=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),h.length>0&&(n.shapes=h),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=s,n;function o(a){const l=[];for(const c in a){const u=a[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const s=e.children[n];this.add(s.clone())}return this}}dt.DEFAULT_UP=new C(0,1,0);dt.DEFAULT_MATRIX_AUTO_UPDATE=!0;dt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const nn=new C,Mn=new C,Qr=new C,Sn=new C,Ti=new C,wi=new C,dl=new C,ea=new C,ta=new C,na=new C;class fn{constructor(e=new C,t=new C,n=new C){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),nn.subVectors(e,t),s.cross(nn);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){nn.subVectors(s,t),Mn.subVectors(n,t),Qr.subVectors(e,t);const o=nn.dot(nn),a=nn.dot(Mn),l=nn.dot(Qr),c=Mn.dot(Mn),u=Mn.dot(Qr),h=o*c-a*a;if(h===0)return r.set(0,0,0),null;const d=1/h,f=(c*l-a*u)*d,g=(o*u-a*l)*d;return r.set(1-f-g,g,f)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,Sn)===null?!1:Sn.x>=0&&Sn.y>=0&&Sn.x+Sn.y<=1}static getInterpolation(e,t,n,s,r,o,a,l){return this.getBarycoord(e,t,n,s,Sn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Sn.x),l.addScaledVector(o,Sn.y),l.addScaledVector(a,Sn.z),l)}static isFrontFacing(e,t,n,s){return nn.subVectors(n,t),Mn.subVectors(e,t),nn.cross(Mn).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return nn.subVectors(this.c,this.b),Mn.subVectors(this.a,this.b),nn.cross(Mn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return fn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return fn.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return fn.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return fn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return fn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,s=this.b,r=this.c;let o,a;Ti.subVectors(s,n),wi.subVectors(r,n),ea.subVectors(e,n);const l=Ti.dot(ea),c=wi.dot(ea);if(l<=0&&c<=0)return t.copy(n);ta.subVectors(e,s);const u=Ti.dot(ta),h=wi.dot(ta);if(u>=0&&h<=u)return t.copy(s);const d=l*h-u*c;if(d<=0&&l>=0&&u<=0)return o=l/(l-u),t.copy(n).addScaledVector(Ti,o);na.subVectors(e,r);const f=Ti.dot(na),g=wi.dot(na);if(g>=0&&f<=g)return t.copy(r);const v=f*c-l*g;if(v<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(n).addScaledVector(wi,a);const m=u*g-f*h;if(m<=0&&h-u>=0&&f-g>=0)return dl.subVectors(r,s),a=(h-u)/(h-u+(f-g)),t.copy(s).addScaledVector(dl,a);const p=1/(m+v+d);return o=v*p,a=d*p,t.copy(n).addScaledVector(Ti,o).addScaledVector(wi,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const $c={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Nn={h:0,s:0,l:0},zs={h:0,s:0,l:0};function ia(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}class Ee{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Kt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Ze.toWorkingColorSpace(this,t),this}setRGB(e,t,n,s=Ze.workingColorSpace){return this.r=e,this.g=t,this.b=n,Ze.toWorkingColorSpace(this,s),this}setHSL(e,t,n,s=Ze.workingColorSpace){if(e=Od(e,1),t=At(t,0,1),n=At(n,0,1),t===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+t):n+t-n*t,o=2*n-r;this.r=ia(o,r,e+1/3),this.g=ia(o,r,e),this.b=ia(o,r,e-1/3)}return Ze.toWorkingColorSpace(this,s),this}setStyle(e,t=Kt){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Kt){const n=$c[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Wi(e.r),this.g=Wi(e.g),this.b=Wi(e.b),this}copyLinearToSRGB(e){return this.r=Wr(e.r),this.g=Wr(e.g),this.b=Wr(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Kt){return Ze.fromWorkingColorSpace(Pt.copy(this),e),Math.round(At(Pt.r*255,0,255))*65536+Math.round(At(Pt.g*255,0,255))*256+Math.round(At(Pt.b*255,0,255))}getHexString(e=Kt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Ze.workingColorSpace){Ze.fromWorkingColorSpace(Pt.copy(this),t);const n=Pt.r,s=Pt.g,r=Pt.b,o=Math.max(n,s,r),a=Math.min(n,s,r);let l,c;const u=(a+o)/2;if(a===o)l=0,c=0;else{const h=o-a;switch(c=u<=.5?h/(o+a):h/(2-o-a),o){case n:l=(s-r)/h+(s<r?6:0);break;case s:l=(r-n)/h+2;break;case r:l=(n-s)/h+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=Ze.workingColorSpace){return Ze.fromWorkingColorSpace(Pt.copy(this),t),e.r=Pt.r,e.g=Pt.g,e.b=Pt.b,e}getStyle(e=Kt){Ze.fromWorkingColorSpace(Pt.copy(this),e);const t=Pt.r,n=Pt.g,s=Pt.b;return e!==Kt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(Nn),this.setHSL(Nn.h+e,Nn.s+t,Nn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Nn),e.getHSL(zs);const n=Gr(Nn.h,zs.h,t),s=Gr(Nn.s,zs.s,t),r=Gr(Nn.l,zs.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Pt=new Ee;Ee.NAMES=$c;let Qd=0;class pi extends hi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Qd++}),this.uuid=Es(),this.name="",this.type="Material",this.blending=Gi,this.side=Gn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Da,this.blendDst=Ia,this.blendEquation=ni,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ee(0,0,0),this.blendAlpha=0,this.depthFunc=ur,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Jo,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=_i,this.stencilZFail=_i,this.stencilZPass=_i,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBuild(){}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Gi&&(n.blending=this.blending),this.side!==Gn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Da&&(n.blendSrc=this.blendSrc),this.blendDst!==Ia&&(n.blendDst=this.blendDst),this.blendEquation!==ni&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==ur&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Jo&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==_i&&(n.stencilFail=this.stencilFail),this.stencilZFail!==_i&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==_i&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const o=[];for(const a in r){const l=r[a];delete l.metadata,o.push(l)}return o}if(t){const r=s(e.textures),o=s(e.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class Wt extends pi{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ee(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new mn,this.combine=wc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const _t=new C,ks=new ie;class Lt{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Qo,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.gpuType=Tn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}get updateRange(){return Vc("THREE.BufferAttribute: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)ks.fromBufferAttribute(this,t),ks.applyMatrix3(e),this.setXY(t,ks.x,ks.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)_t.fromBufferAttribute(this,t),_t.applyMatrix3(e),this.setXYZ(t,_t.x,_t.y,_t.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)_t.fromBufferAttribute(this,t),_t.applyMatrix4(e),this.setXYZ(t,_t.x,_t.y,_t.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)_t.fromBufferAttribute(this,t),_t.applyNormalMatrix(e),this.setXYZ(t,_t.x,_t.y,_t.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)_t.fromBufferAttribute(this,t),_t.transformDirection(e),this.setXYZ(t,_t.x,_t.y,_t.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=es(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Ot(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=es(t,this.array)),t}setX(e,t){return this.normalized&&(t=Ot(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=es(t,this.array)),t}setY(e,t){return this.normalized&&(t=Ot(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=es(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Ot(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=es(t,this.array)),t}setW(e,t){return this.normalized&&(t=Ot(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Ot(t,this.array),n=Ot(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=Ot(t,this.array),n=Ot(n,this.array),s=Ot(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=Ot(t,this.array),n=Ot(n,this.array),s=Ot(s,this.array),r=Ot(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Qo&&(e.usage=this.usage),e}}class qc extends Lt{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class Yc extends Lt{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class We extends Lt{constructor(e,t,n){super(new Float32Array(e),t,n)}}let ef=0;const Yt=new et,sa=new dt,Ai=new C,Vt=new di,ss=new di,bt=new C;class Ke extends hi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:ef++}),this.uuid=Es(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Gc(e)?Yc:qc)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Ne().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Yt.makeRotationFromQuaternion(e),this.applyMatrix4(Yt),this}rotateX(e){return Yt.makeRotationX(e),this.applyMatrix4(Yt),this}rotateY(e){return Yt.makeRotationY(e),this.applyMatrix4(Yt),this}rotateZ(e){return Yt.makeRotationZ(e),this.applyMatrix4(Yt),this}translate(e,t,n){return Yt.makeTranslation(e,t,n),this.applyMatrix4(Yt),this}scale(e,t,n){return Yt.makeScale(e,t,n),this.applyMatrix4(Yt),this}lookAt(e){return sa.lookAt(e),sa.updateMatrix(),this.applyMatrix4(sa.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ai).negate(),this.translate(Ai.x,Ai.y,Ai.z),this}setFromPoints(e){const t=[];for(let n=0,s=e.length;n<s;n++){const r=e[n];t.push(r.x,r.y,r.z||0)}return this.setAttribute("position",new We(t,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new di);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new C(-1/0,-1/0,-1/0),new C(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){const r=t[n];Vt.setFromBufferAttribute(r),this.morphTargetsRelative?(bt.addVectors(this.boundingBox.min,Vt.min),this.boundingBox.expandByPoint(bt),bt.addVectors(this.boundingBox.max,Vt.max),this.boundingBox.expandByPoint(bt)):(this.boundingBox.expandByPoint(Vt.min),this.boundingBox.expandByPoint(Vt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new fi);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new C,1/0);return}if(e){const n=this.boundingSphere.center;if(Vt.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){const a=t[r];ss.setFromBufferAttribute(a),this.morphTargetsRelative?(bt.addVectors(Vt.min,ss.min),Vt.expandByPoint(bt),bt.addVectors(Vt.max,ss.max),Vt.expandByPoint(bt)):(Vt.expandByPoint(ss.min),Vt.expandByPoint(ss.max))}Vt.getCenter(n);let s=0;for(let r=0,o=e.count;r<o;r++)bt.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(bt));if(t)for(let r=0,o=t.length;r<o;r++){const a=t[r],l=this.morphTargetsRelative;for(let c=0,u=a.count;c<u;c++)bt.fromBufferAttribute(a,c),l&&(Ai.fromBufferAttribute(e,c),bt.add(Ai)),s=Math.max(s,n.distanceToSquared(bt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Lt(new Float32Array(4*n.count),4));const o=this.getAttribute("tangent"),a=[],l=[];for(let U=0;U<n.count;U++)a[U]=new C,l[U]=new C;const c=new C,u=new C,h=new C,d=new ie,f=new ie,g=new ie,v=new C,m=new C;function p(U,b,M){c.fromBufferAttribute(n,U),u.fromBufferAttribute(n,b),h.fromBufferAttribute(n,M),d.fromBufferAttribute(r,U),f.fromBufferAttribute(r,b),g.fromBufferAttribute(r,M),u.sub(c),h.sub(c),f.sub(d),g.sub(d);const P=1/(f.x*g.y-g.x*f.y);isFinite(P)&&(v.copy(u).multiplyScalar(g.y).addScaledVector(h,-f.y).multiplyScalar(P),m.copy(h).multiplyScalar(f.x).addScaledVector(u,-g.x).multiplyScalar(P),a[U].add(v),a[b].add(v),a[M].add(v),l[U].add(m),l[b].add(m),l[M].add(m))}let E=this.groups;E.length===0&&(E=[{start:0,count:e.count}]);for(let U=0,b=E.length;U<b;++U){const M=E[U],P=M.start,k=M.count;for(let B=P,$=P+k;B<$;B+=3)p(e.getX(B+0),e.getX(B+1),e.getX(B+2))}const y=new C,T=new C,D=new C,R=new C;function w(U){D.fromBufferAttribute(s,U),R.copy(D);const b=a[U];y.copy(b),y.sub(D.multiplyScalar(D.dot(b))).normalize(),T.crossVectors(R,b);const P=T.dot(l[U])<0?-1:1;o.setXYZW(U,y.x,y.y,y.z,P)}for(let U=0,b=E.length;U<b;++U){const M=E[U],P=M.start,k=M.count;for(let B=P,$=P+k;B<$;B+=3)w(e.getX(B+0)),w(e.getX(B+1)),w(e.getX(B+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Lt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);const s=new C,r=new C,o=new C,a=new C,l=new C,c=new C,u=new C,h=new C;if(e)for(let d=0,f=e.count;d<f;d+=3){const g=e.getX(d+0),v=e.getX(d+1),m=e.getX(d+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,v),o.fromBufferAttribute(t,m),u.subVectors(o,r),h.subVectors(s,r),u.cross(h),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,v),c.fromBufferAttribute(n,m),a.add(u),l.add(u),c.add(u),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(v,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let d=0,f=t.count;d<f;d+=3)s.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),o.fromBufferAttribute(t,d+2),u.subVectors(o,r),h.subVectors(s,r),u.cross(h),n.setXYZ(d+0,u.x,u.y,u.z),n.setXYZ(d+1,u.x,u.y,u.z),n.setXYZ(d+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)bt.fromBufferAttribute(e,t),bt.normalize(),e.setXYZ(t,bt.x,bt.y,bt.z)}toNonIndexed(){function e(a,l){const c=a.array,u=a.itemSize,h=a.normalized,d=new c.constructor(l.length*u);let f=0,g=0;for(let v=0,m=l.length;v<m;v++){a.isInterleavedBufferAttribute?f=l[v]*a.data.stride+a.offset:f=l[v]*u;for(let p=0;p<u;p++)d[g++]=c[f++]}return new Lt(d,u,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Ke,n=this.index.array,s=this.attributes;for(const a in s){const l=s[a],c=e(l,n);t.setAttribute(a,c)}const r=this.morphAttributes;for(const a in r){const l=[],c=r[a];for(let u=0,h=c.length;u<h;u++){const d=c[u],f=e(d,n);l.push(f)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],u=[];for(let h=0,d=c.length;h<d;h++){const f=c[h];u.push(f.toJSON(e.data))}u.length>0&&(s[l]=u,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone(t));const s=e.attributes;for(const c in s){const u=s[c];this.setAttribute(c,u.clone(t))}const r=e.morphAttributes;for(const c in r){const u=[],h=r[c];for(let d=0,f=h.length;d<f;d++)u.push(h[d].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let c=0,u=o.length;c<u;c++){const h=o[c];this.addGroup(h.start,h.count,h.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const fl=new et,Zn=new Ts,Hs=new fi,pl=new C,Ci=new C,Ri=new C,Pi=new C,ra=new C,Gs=new C,Vs=new ie,Ws=new ie,Xs=new ie,ml=new C,gl=new C,_l=new C,$s=new C,qs=new C;class be extends dt{constructor(e=new Ke,t=new Wt){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(s,e);const a=this.morphTargetInfluences;if(r&&a){Gs.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const u=a[l],h=r[l];u!==0&&(ra.fromBufferAttribute(h,e),o?Gs.addScaledVector(ra,u):Gs.addScaledVector(ra.sub(t),u))}t.add(Gs)}return t}raycast(e,t){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Hs.copy(n.boundingSphere),Hs.applyMatrix4(r),Zn.copy(e.ray).recast(e.near),!(Hs.containsPoint(Zn.origin)===!1&&(Zn.intersectSphere(Hs,pl)===null||Zn.origin.distanceToSquared(pl)>(e.far-e.near)**2))&&(fl.copy(r).invert(),Zn.copy(e.ray).applyMatrix4(fl),!(n.boundingBox!==null&&Zn.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Zn)))}_computeIntersections(e,t,n){let s;const r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,h=r.attributes.normal,d=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,v=d.length;g<v;g++){const m=d[g],p=o[m.materialIndex],E=Math.max(m.start,f.start),y=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let T=E,D=y;T<D;T+=3){const R=a.getX(T),w=a.getX(T+1),U=a.getX(T+2);s=Ys(this,p,e,n,c,u,h,R,w,U),s&&(s.faceIndex=Math.floor(T/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const g=Math.max(0,f.start),v=Math.min(a.count,f.start+f.count);for(let m=g,p=v;m<p;m+=3){const E=a.getX(m),y=a.getX(m+1),T=a.getX(m+2);s=Ys(this,o,e,n,c,u,h,E,y,T),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,v=d.length;g<v;g++){const m=d[g],p=o[m.materialIndex],E=Math.max(m.start,f.start),y=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let T=E,D=y;T<D;T+=3){const R=T,w=T+1,U=T+2;s=Ys(this,p,e,n,c,u,h,R,w,U),s&&(s.faceIndex=Math.floor(T/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const g=Math.max(0,f.start),v=Math.min(l.count,f.start+f.count);for(let m=g,p=v;m<p;m+=3){const E=m,y=m+1,T=m+2;s=Ys(this,o,e,n,c,u,h,E,y,T),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}}function tf(i,e,t,n,s,r,o,a){let l;if(e.side===Dt?l=n.intersectTriangle(o,r,s,!0,a):l=n.intersectTriangle(s,r,o,e.side===Gn,a),l===null)return null;qs.copy(a),qs.applyMatrix4(i.matrixWorld);const c=t.ray.origin.distanceTo(qs);return c<t.near||c>t.far?null:{distance:c,point:qs.clone(),object:i}}function Ys(i,e,t,n,s,r,o,a,l,c){i.getVertexPosition(a,Ci),i.getVertexPosition(l,Ri),i.getVertexPosition(c,Pi);const u=tf(i,e,t,n,Ci,Ri,Pi,$s);if(u){s&&(Vs.fromBufferAttribute(s,a),Ws.fromBufferAttribute(s,l),Xs.fromBufferAttribute(s,c),u.uv=fn.getInterpolation($s,Ci,Ri,Pi,Vs,Ws,Xs,new ie)),r&&(Vs.fromBufferAttribute(r,a),Ws.fromBufferAttribute(r,l),Xs.fromBufferAttribute(r,c),u.uv1=fn.getInterpolation($s,Ci,Ri,Pi,Vs,Ws,Xs,new ie)),o&&(ml.fromBufferAttribute(o,a),gl.fromBufferAttribute(o,l),_l.fromBufferAttribute(o,c),u.normal=fn.getInterpolation($s,Ci,Ri,Pi,ml,gl,_l,new C),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));const h={a,b:l,c,normal:new C,materialIndex:0};fn.getNormal(Ci,Ri,Pi,h.normal),u.face=h}return u}class xt extends Ke{constructor(e=1,t=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};const a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);const l=[],c=[],u=[],h=[];let d=0,f=0;g("z","y","x",-1,-1,n,t,e,o,r,0),g("z","y","x",1,-1,n,t,-e,o,r,1),g("x","z","y",1,1,e,n,t,s,o,2),g("x","z","y",1,-1,e,n,-t,s,o,3),g("x","y","z",1,-1,e,t,n,s,r,4),g("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new We(c,3)),this.setAttribute("normal",new We(u,3)),this.setAttribute("uv",new We(h,2));function g(v,m,p,E,y,T,D,R,w,U,b){const M=T/w,P=D/U,k=T/2,B=D/2,$=R/2,Y=w+1,W=U+1;let j=0,X=0;const ue=new C;for(let he=0;he<W;he++){const pe=he*P-B;for(let He=0;He<Y;He++){const $e=He*M-k;ue[v]=$e*E,ue[m]=pe*y,ue[p]=$,c.push(ue.x,ue.y,ue.z),ue[v]=0,ue[m]=0,ue[p]=R>0?1:-1,u.push(ue.x,ue.y,ue.z),h.push(He/w),h.push(1-he/U),j+=1}}for(let he=0;he<U;he++)for(let pe=0;pe<w;pe++){const He=d+pe+Y*he,$e=d+pe+Y*(he+1),q=d+(pe+1)+Y*(he+1),ee=d+(pe+1)+Y*he;l.push(He,$e,ee),l.push($e,q,ee),X+=6}a.addGroup(f,X,b),f+=X,d+=j}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new xt(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Ki(i){const e={};for(const t in i){e[t]={};for(const n in i[t]){const s=i[t][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone():Array.isArray(s)?e[t][n]=s.slice():e[t][n]=s}}return e}function Nt(i){const e={};for(let t=0;t<i.length;t++){const n=Ki(i[t]);for(const s in n)e[s]=n[s]}return e}function nf(i){const e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function jc(i){const e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Ze.workingColorSpace}const ys={clone:Ki,merge:Nt};var sf=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,rf=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Ct extends pi{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=sf,this.fragmentShader=rf,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ki(e.uniforms),this.uniformsGroups=nf(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class Kc extends dt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new et,this.projectionMatrix=new et,this.projectionMatrixInverse=new et,this.coordinateSystem=wn}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const On=new C,vl=new ie,xl=new ie;class Jt extends Kc{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Fa*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(or*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Fa*2*Math.atan(Math.tan(or*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){On.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(On.x,On.y).multiplyScalar(-e/On.z),On.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(On.x,On.y).multiplyScalar(-e/On.z)}getViewSize(e,t){return this.getViewBounds(e,vl,xl),t.subVectors(xl,vl)}setViewOffset(e,t,n,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(or*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,t-=o.offsetY*n/c,s*=o.width/l,n*=o.height/c}const a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const Li=-90,Di=1;class af extends dt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new Jt(Li,Di,e,t);s.layers=this.layers,this.add(s);const r=new Jt(Li,Di,e,t);r.layers=this.layers,this.add(r);const o=new Jt(Li,Di,e,t);o.layers=this.layers,this.add(o);const a=new Jt(Li,Di,e,t);a.layers=this.layers,this.add(a);const l=new Jt(Li,Di,e,t);l.layers=this.layers,this.add(l);const c=new Jt(Li,Di,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,s,r,o,a,l]=t;for(const c of t)this.remove(c);if(e===wn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===mr)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,o,a,l,c,u]=this.children,h=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const v=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,s),e.render(t,r),e.setRenderTarget(n,1,s),e.render(t,o),e.setRenderTarget(n,2,s),e.render(t,a),e.setRenderTarget(n,3,s),e.render(t,l),e.setRenderTarget(n,4,s),e.render(t,c),n.texture.generateMipmaps=v,e.setRenderTarget(n,5,s),e.render(t,u),e.setRenderTarget(h,d,f),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class Zc extends It{constructor(e,t,n,s,r,o,a,l,c,u){e=e!==void 0?e:[],t=t!==void 0?t:Xi,super(e,t,n,s,r,o,a,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class of extends an{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new Zc(s,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:rn}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new xt(5,5,5),r=new Ct({name:"CubemapFromEquirect",uniforms:Ki(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Dt,blending:An});r.uniforms.tEquirect.value=t;const o=new be(s,r),a=t.minFilter;return t.minFilter===ri&&(t.minFilter=rn),new af(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,n,s){const r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,s);e.setRenderTarget(r)}}const aa=new C,lf=new C,cf=new Ne;class Fn{constructor(e=new C(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const s=aa.subVectors(n,t).cross(lf.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(aa),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||cf.getNormalMatrix(e),s=this.coplanarPoint(aa).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Jn=new fi,js=new C;class eo{constructor(e=new Fn,t=new Fn,n=new Fn,s=new Fn,r=new Fn,o=new Fn){this.planes=[e,t,n,s,r,o]}set(e,t,n,s,r,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=wn){const n=this.planes,s=e.elements,r=s[0],o=s[1],a=s[2],l=s[3],c=s[4],u=s[5],h=s[6],d=s[7],f=s[8],g=s[9],v=s[10],m=s[11],p=s[12],E=s[13],y=s[14],T=s[15];if(n[0].setComponents(l-r,d-c,m-f,T-p).normalize(),n[1].setComponents(l+r,d+c,m+f,T+p).normalize(),n[2].setComponents(l+o,d+u,m+g,T+E).normalize(),n[3].setComponents(l-o,d-u,m-g,T-E).normalize(),n[4].setComponents(l-a,d-h,m-v,T-y).normalize(),t===wn)n[5].setComponents(l+a,d+h,m+v,T+y).normalize();else if(t===mr)n[5].setComponents(a,h,v,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Jn.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Jn.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Jn)}intersectsSprite(e){return Jn.center.set(0,0,0),Jn.radius=.7071067811865476,Jn.applyMatrix4(e.matrixWorld),this.intersectsSphere(Jn)}intersectsSphere(e){const t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const s=t[n];if(js.x=s.normal.x>0?e.max.x:e.min.x,js.y=s.normal.y>0?e.max.y:e.min.y,js.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(js)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function Jc(){let i=null,e=!1,t=null,n=null;function s(r,o){t(r,o),n=i.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function uf(i){const e=new WeakMap;function t(a,l){const c=a.array,u=a.usage,h=c.byteLength,d=i.createBuffer();i.bindBuffer(l,d),i.bufferData(l,c,u),a.onUploadCallback();let f;if(c instanceof Float32Array)f=i.FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=i.SHORT;else if(c instanceof Uint32Array)f=i.UNSIGNED_INT;else if(c instanceof Int32Array)f=i.INT;else if(c instanceof Int8Array)f=i.BYTE;else if(c instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:h}}function n(a,l,c){const u=l.array,h=l._updateRange,d=l.updateRanges;if(i.bindBuffer(c,a),h.count===-1&&d.length===0&&i.bufferSubData(c,0,u),d.length!==0){for(let f=0,g=d.length;f<g;f++){const v=d[f];i.bufferSubData(c,v.start*u.BYTES_PER_ELEMENT,u,v.start,v.count)}l.clearUpdateRanges()}h.count!==-1&&(i.bufferSubData(c,h.offset*u.BYTES_PER_ELEMENT,u,h.offset,h.count),h.count=-1),l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);const l=e.get(a);l&&(i.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isGLBufferAttribute){const u=e.get(a);(!u||u.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}a.isInterleavedBufferAttribute&&(a=a.data);const c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}class li extends Ke{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};const r=e/2,o=t/2,a=Math.floor(n),l=Math.floor(s),c=a+1,u=l+1,h=e/a,d=t/l,f=[],g=[],v=[],m=[];for(let p=0;p<u;p++){const E=p*d-o;for(let y=0;y<c;y++){const T=y*h-r;g.push(T,-E,0),v.push(0,0,1),m.push(y/a),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let E=0;E<a;E++){const y=E+c*p,T=E+c*(p+1),D=E+1+c*(p+1),R=E+1+c*p;f.push(y,T,R),f.push(T,D,R)}this.setIndex(f),this.setAttribute("position",new We(g,3)),this.setAttribute("normal",new We(v,3)),this.setAttribute("uv",new We(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new li(e.width,e.height,e.widthSegments,e.heightSegments)}}var hf=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,df=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,ff=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,pf=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,mf=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,gf=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,_f=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,vf=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,xf=`#ifdef USE_BATCHING
	attribute float batchId;
	uniform highp sampler2D batchingTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,yf=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( batchId );
#endif`,Mf=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Sf=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bf=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Ef=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Tf=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,wf=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Af=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Cf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Rf=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Pf=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Lf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Df=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,If=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( batchId );
	vColor.xyz *= batchingColor.xyz;
#endif`,Uf=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
float luminance( const in vec3 rgb ) {
	const vec3 weights = vec3( 0.2126729, 0.7151522, 0.0721750 );
	return dot( weights, rgb );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Nf=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Of=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Ff=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Bf=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,zf=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,kf=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Hf="gl_FragColor = linearToOutputTexel( gl_FragColor );",Gf=`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}
vec4 LinearToLinear( in vec4 value ) {
	return value;
}
vec4 LinearTosRGB( in vec4 value ) {
	return sRGBTransferOETF( value );
}`,Vf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,Wf=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Xf=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,$f=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,qf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Yf=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,jf=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Kf=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Zf=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Jf=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Qf=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,ep=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,tp=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,np=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,ip=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,sp=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,rp=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,ap=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,op=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lp=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,cp=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,up=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,hp=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,dp=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,fp=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,pp=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,mp=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,gp=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,_p=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,vp=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,xp=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,yp=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Mp=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Sp=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,bp=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Ep=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Tp=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,wp=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Ap=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Cp=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Rp=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Pp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Lp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Dp=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Ip=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Up=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Np=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Op=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Fp=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Bp=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,zp=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;
const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
const float ShiftRight8 = 1. / 256.;
vec4 packDepthToRGBA( const in float v ) {
	vec4 r = vec4( fract( v * PackFactors ), v );
	r.yzw -= r.xyz * ShiftRight8;	return r * PackUpscale;
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors );
}
vec2 packDepthToRG( in highp float v ) {
	return packDepthToRGBA( v ).yx;
}
float unpackRGToDepth( const in highp vec2 v ) {
	return unpackRGBAToDepth( vec4( v.xy, 0.0, 0.0 ) );
}
vec4 pack2HalfToRGBA( vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,kp=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Hp=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Gp=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Vp=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Wp=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Xp=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,$p=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return shadow;
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return shadow;
	}
#endif`,qp=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Yp=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,jp=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Kp=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Zp=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Jp=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Qp=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,em=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,tm=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,nm=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,im=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 OptimizedCineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,sm=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,rm=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,am=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,om=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,lm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,cm=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const um=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,hm=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,dm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,fm=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,pm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,mm=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,gm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,_m=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#endif
}`,vm=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,xm=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,ym=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Mm=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Sm=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,bm=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Em=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Tm=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,wm=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Am=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Cm=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Rm=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Pm=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Lm=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Dm=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Im=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Um=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Nm=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Om=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Fm=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Bm=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,zm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,km=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Hm=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Gm=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec2 scale;
	scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
	scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Vm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Ue={alphahash_fragment:hf,alphahash_pars_fragment:df,alphamap_fragment:ff,alphamap_pars_fragment:pf,alphatest_fragment:mf,alphatest_pars_fragment:gf,aomap_fragment:_f,aomap_pars_fragment:vf,batching_pars_vertex:xf,batching_vertex:yf,begin_vertex:Mf,beginnormal_vertex:Sf,bsdfs:bf,iridescence_fragment:Ef,bumpmap_pars_fragment:Tf,clipping_planes_fragment:wf,clipping_planes_pars_fragment:Af,clipping_planes_pars_vertex:Cf,clipping_planes_vertex:Rf,color_fragment:Pf,color_pars_fragment:Lf,color_pars_vertex:Df,color_vertex:If,common:Uf,cube_uv_reflection_fragment:Nf,defaultnormal_vertex:Of,displacementmap_pars_vertex:Ff,displacementmap_vertex:Bf,emissivemap_fragment:zf,emissivemap_pars_fragment:kf,colorspace_fragment:Hf,colorspace_pars_fragment:Gf,envmap_fragment:Vf,envmap_common_pars_fragment:Wf,envmap_pars_fragment:Xf,envmap_pars_vertex:$f,envmap_physical_pars_fragment:ip,envmap_vertex:qf,fog_vertex:Yf,fog_pars_vertex:jf,fog_fragment:Kf,fog_pars_fragment:Zf,gradientmap_pars_fragment:Jf,lightmap_pars_fragment:Qf,lights_lambert_fragment:ep,lights_lambert_pars_fragment:tp,lights_pars_begin:np,lights_toon_fragment:sp,lights_toon_pars_fragment:rp,lights_phong_fragment:ap,lights_phong_pars_fragment:op,lights_physical_fragment:lp,lights_physical_pars_fragment:cp,lights_fragment_begin:up,lights_fragment_maps:hp,lights_fragment_end:dp,logdepthbuf_fragment:fp,logdepthbuf_pars_fragment:pp,logdepthbuf_pars_vertex:mp,logdepthbuf_vertex:gp,map_fragment:_p,map_pars_fragment:vp,map_particle_fragment:xp,map_particle_pars_fragment:yp,metalnessmap_fragment:Mp,metalnessmap_pars_fragment:Sp,morphinstance_vertex:bp,morphcolor_vertex:Ep,morphnormal_vertex:Tp,morphtarget_pars_vertex:wp,morphtarget_vertex:Ap,normal_fragment_begin:Cp,normal_fragment_maps:Rp,normal_pars_fragment:Pp,normal_pars_vertex:Lp,normal_vertex:Dp,normalmap_pars_fragment:Ip,clearcoat_normal_fragment_begin:Up,clearcoat_normal_fragment_maps:Np,clearcoat_pars_fragment:Op,iridescence_pars_fragment:Fp,opaque_fragment:Bp,packing:zp,premultiplied_alpha_fragment:kp,project_vertex:Hp,dithering_fragment:Gp,dithering_pars_fragment:Vp,roughnessmap_fragment:Wp,roughnessmap_pars_fragment:Xp,shadowmap_pars_fragment:$p,shadowmap_pars_vertex:qp,shadowmap_vertex:Yp,shadowmask_pars_fragment:jp,skinbase_vertex:Kp,skinning_pars_vertex:Zp,skinning_vertex:Jp,skinnormal_vertex:Qp,specularmap_fragment:em,specularmap_pars_fragment:tm,tonemapping_fragment:nm,tonemapping_pars_fragment:im,transmission_fragment:sm,transmission_pars_fragment:rm,uv_pars_fragment:am,uv_pars_vertex:om,uv_vertex:lm,worldpos_vertex:cm,background_vert:um,background_frag:hm,backgroundCube_vert:dm,backgroundCube_frag:fm,cube_vert:pm,cube_frag:mm,depth_vert:gm,depth_frag:_m,distanceRGBA_vert:vm,distanceRGBA_frag:xm,equirect_vert:ym,equirect_frag:Mm,linedashed_vert:Sm,linedashed_frag:bm,meshbasic_vert:Em,meshbasic_frag:Tm,meshlambert_vert:wm,meshlambert_frag:Am,meshmatcap_vert:Cm,meshmatcap_frag:Rm,meshnormal_vert:Pm,meshnormal_frag:Lm,meshphong_vert:Dm,meshphong_frag:Im,meshphysical_vert:Um,meshphysical_frag:Nm,meshtoon_vert:Om,meshtoon_frag:Fm,points_vert:Bm,points_frag:zm,shadow_vert:km,shadow_frag:Hm,sprite_vert:Gm,sprite_frag:Vm},ae={common:{diffuse:{value:new Ee(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ne},alphaMap:{value:null},alphaMapTransform:{value:new Ne},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ne}},envmap:{envMap:{value:null},envMapRotation:{value:new Ne},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ne}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ne}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ne},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ne},normalScale:{value:new ie(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ne},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ne}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ne}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ne}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ee(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ee(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ne},alphaTest:{value:0},uvTransform:{value:new Ne}},sprite:{diffuse:{value:new Ee(16777215)},opacity:{value:1},center:{value:new ie(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ne},alphaMap:{value:null},alphaMapTransform:{value:new Ne},alphaTest:{value:0}}},dn={basic:{uniforms:Nt([ae.common,ae.specularmap,ae.envmap,ae.aomap,ae.lightmap,ae.fog]),vertexShader:Ue.meshbasic_vert,fragmentShader:Ue.meshbasic_frag},lambert:{uniforms:Nt([ae.common,ae.specularmap,ae.envmap,ae.aomap,ae.lightmap,ae.emissivemap,ae.bumpmap,ae.normalmap,ae.displacementmap,ae.fog,ae.lights,{emissive:{value:new Ee(0)}}]),vertexShader:Ue.meshlambert_vert,fragmentShader:Ue.meshlambert_frag},phong:{uniforms:Nt([ae.common,ae.specularmap,ae.envmap,ae.aomap,ae.lightmap,ae.emissivemap,ae.bumpmap,ae.normalmap,ae.displacementmap,ae.fog,ae.lights,{emissive:{value:new Ee(0)},specular:{value:new Ee(1118481)},shininess:{value:30}}]),vertexShader:Ue.meshphong_vert,fragmentShader:Ue.meshphong_frag},standard:{uniforms:Nt([ae.common,ae.envmap,ae.aomap,ae.lightmap,ae.emissivemap,ae.bumpmap,ae.normalmap,ae.displacementmap,ae.roughnessmap,ae.metalnessmap,ae.fog,ae.lights,{emissive:{value:new Ee(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ue.meshphysical_vert,fragmentShader:Ue.meshphysical_frag},toon:{uniforms:Nt([ae.common,ae.aomap,ae.lightmap,ae.emissivemap,ae.bumpmap,ae.normalmap,ae.displacementmap,ae.gradientmap,ae.fog,ae.lights,{emissive:{value:new Ee(0)}}]),vertexShader:Ue.meshtoon_vert,fragmentShader:Ue.meshtoon_frag},matcap:{uniforms:Nt([ae.common,ae.bumpmap,ae.normalmap,ae.displacementmap,ae.fog,{matcap:{value:null}}]),vertexShader:Ue.meshmatcap_vert,fragmentShader:Ue.meshmatcap_frag},points:{uniforms:Nt([ae.points,ae.fog]),vertexShader:Ue.points_vert,fragmentShader:Ue.points_frag},dashed:{uniforms:Nt([ae.common,ae.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ue.linedashed_vert,fragmentShader:Ue.linedashed_frag},depth:{uniforms:Nt([ae.common,ae.displacementmap]),vertexShader:Ue.depth_vert,fragmentShader:Ue.depth_frag},normal:{uniforms:Nt([ae.common,ae.bumpmap,ae.normalmap,ae.displacementmap,{opacity:{value:1}}]),vertexShader:Ue.meshnormal_vert,fragmentShader:Ue.meshnormal_frag},sprite:{uniforms:Nt([ae.sprite,ae.fog]),vertexShader:Ue.sprite_vert,fragmentShader:Ue.sprite_frag},background:{uniforms:{uvTransform:{value:new Ne},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ue.background_vert,fragmentShader:Ue.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ne}},vertexShader:Ue.backgroundCube_vert,fragmentShader:Ue.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ue.cube_vert,fragmentShader:Ue.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ue.equirect_vert,fragmentShader:Ue.equirect_frag},distanceRGBA:{uniforms:Nt([ae.common,ae.displacementmap,{referencePosition:{value:new C},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ue.distanceRGBA_vert,fragmentShader:Ue.distanceRGBA_frag},shadow:{uniforms:Nt([ae.lights,ae.fog,{color:{value:new Ee(0)},opacity:{value:1}}]),vertexShader:Ue.shadow_vert,fragmentShader:Ue.shadow_frag}};dn.physical={uniforms:Nt([dn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ne},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ne},clearcoatNormalScale:{value:new ie(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ne},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ne},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ne},sheen:{value:0},sheenColor:{value:new Ee(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ne},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ne},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ne},transmissionSamplerSize:{value:new ie},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ne},attenuationDistance:{value:0},attenuationColor:{value:new Ee(0)},specularColor:{value:new Ee(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ne},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ne},anisotropyVector:{value:new ie},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ne}}]),vertexShader:Ue.meshphysical_vert,fragmentShader:Ue.meshphysical_frag};const Ks={r:0,b:0,g:0},Qn=new mn,Wm=new et;function Xm(i,e,t,n,s,r,o){const a=new Ee(0);let l=r===!0?0:1,c,u,h=null,d=0,f=null;function g(E){let y=E.isScene===!0?E.background:null;return y&&y.isTexture&&(y=(E.backgroundBlurriness>0?t:e).get(y)),y}function v(E){let y=!1;const T=g(E);T===null?p(a,l):T&&T.isColor&&(p(T,1),y=!0);const D=i.xr.getEnvironmentBlendMode();D==="additive"?n.buffers.color.setClear(0,0,0,1,o):D==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(i.autoClear||y)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function m(E,y){const T=g(y);T&&(T.isCubeTexture||T.mapping===br)?(u===void 0&&(u=new be(new xt(1,1,1),new Ct({name:"BackgroundCubeMaterial",uniforms:Ki(dn.backgroundCube.uniforms),vertexShader:dn.backgroundCube.vertexShader,fragmentShader:dn.backgroundCube.fragmentShader,side:Dt,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(D,R,w){this.matrixWorld.copyPosition(w.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(u)),Qn.copy(y.backgroundRotation),Qn.x*=-1,Qn.y*=-1,Qn.z*=-1,T.isCubeTexture&&T.isRenderTargetTexture===!1&&(Qn.y*=-1,Qn.z*=-1),u.material.uniforms.envMap.value=T,u.material.uniforms.flipEnvMap.value=T.isCubeTexture&&T.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=y.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(Wm.makeRotationFromEuler(Qn)),u.material.toneMapped=Ze.getTransfer(T.colorSpace)!==st,(h!==T||d!==T.version||f!==i.toneMapping)&&(u.material.needsUpdate=!0,h=T,d=T.version,f=i.toneMapping),u.layers.enableAll(),E.unshift(u,u.geometry,u.material,0,0,null)):T&&T.isTexture&&(c===void 0&&(c=new be(new li(2,2),new Ct({name:"BackgroundMaterial",uniforms:Ki(dn.background.uniforms),vertexShader:dn.background.vertexShader,fragmentShader:dn.background.fragmentShader,side:Gn,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=T,c.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,c.material.toneMapped=Ze.getTransfer(T.colorSpace)!==st,T.matrixAutoUpdate===!0&&T.updateMatrix(),c.material.uniforms.uvTransform.value.copy(T.matrix),(h!==T||d!==T.version||f!==i.toneMapping)&&(c.material.needsUpdate=!0,h=T,d=T.version,f=i.toneMapping),c.layers.enableAll(),E.unshift(c,c.geometry,c.material,0,0,null))}function p(E,y){E.getRGB(Ks,jc(i)),n.buffers.color.setClear(Ks.r,Ks.g,Ks.b,y,o)}return{getClearColor:function(){return a},setClearColor:function(E,y=1){a.set(E),l=y,p(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(E){l=E,p(a,l)},render:v,addToRenderList:m}}function $m(i,e){const t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=d(null);let r=s,o=!1;function a(M,P,k,B,$){let Y=!1;const W=h(B,k,P);r!==W&&(r=W,c(r.object)),Y=f(M,B,k,$),Y&&g(M,B,k,$),$!==null&&e.update($,i.ELEMENT_ARRAY_BUFFER),(Y||o)&&(o=!1,T(M,P,k,B),$!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get($).buffer))}function l(){return i.createVertexArray()}function c(M){return i.bindVertexArray(M)}function u(M){return i.deleteVertexArray(M)}function h(M,P,k){const B=k.wireframe===!0;let $=n[M.id];$===void 0&&($={},n[M.id]=$);let Y=$[P.id];Y===void 0&&(Y={},$[P.id]=Y);let W=Y[B];return W===void 0&&(W=d(l()),Y[B]=W),W}function d(M){const P=[],k=[],B=[];for(let $=0;$<t;$++)P[$]=0,k[$]=0,B[$]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:P,enabledAttributes:k,attributeDivisors:B,object:M,attributes:{},index:null}}function f(M,P,k,B){const $=r.attributes,Y=P.attributes;let W=0;const j=k.getAttributes();for(const X in j)if(j[X].location>=0){const he=$[X];let pe=Y[X];if(pe===void 0&&(X==="instanceMatrix"&&M.instanceMatrix&&(pe=M.instanceMatrix),X==="instanceColor"&&M.instanceColor&&(pe=M.instanceColor)),he===void 0||he.attribute!==pe||pe&&he.data!==pe.data)return!0;W++}return r.attributesNum!==W||r.index!==B}function g(M,P,k,B){const $={},Y=P.attributes;let W=0;const j=k.getAttributes();for(const X in j)if(j[X].location>=0){let he=Y[X];he===void 0&&(X==="instanceMatrix"&&M.instanceMatrix&&(he=M.instanceMatrix),X==="instanceColor"&&M.instanceColor&&(he=M.instanceColor));const pe={};pe.attribute=he,he&&he.data&&(pe.data=he.data),$[X]=pe,W++}r.attributes=$,r.attributesNum=W,r.index=B}function v(){const M=r.newAttributes;for(let P=0,k=M.length;P<k;P++)M[P]=0}function m(M){p(M,0)}function p(M,P){const k=r.newAttributes,B=r.enabledAttributes,$=r.attributeDivisors;k[M]=1,B[M]===0&&(i.enableVertexAttribArray(M),B[M]=1),$[M]!==P&&(i.vertexAttribDivisor(M,P),$[M]=P)}function E(){const M=r.newAttributes,P=r.enabledAttributes;for(let k=0,B=P.length;k<B;k++)P[k]!==M[k]&&(i.disableVertexAttribArray(k),P[k]=0)}function y(M,P,k,B,$,Y,W){W===!0?i.vertexAttribIPointer(M,P,k,$,Y):i.vertexAttribPointer(M,P,k,B,$,Y)}function T(M,P,k,B){v();const $=B.attributes,Y=k.getAttributes(),W=P.defaultAttributeValues;for(const j in Y){const X=Y[j];if(X.location>=0){let ue=$[j];if(ue===void 0&&(j==="instanceMatrix"&&M.instanceMatrix&&(ue=M.instanceMatrix),j==="instanceColor"&&M.instanceColor&&(ue=M.instanceColor)),ue!==void 0){const he=ue.normalized,pe=ue.itemSize,He=e.get(ue);if(He===void 0)continue;const $e=He.buffer,q=He.type,ee=He.bytesPerElement,de=q===i.INT||q===i.UNSIGNED_INT||ue.gpuType===Ic;if(ue.isInterleavedBufferAttribute){const oe=ue.data,Oe=oe.stride,Re=ue.offset;if(oe.isInstancedInterleavedBuffer){for(let Ge=0;Ge<X.locationSize;Ge++)p(X.location+Ge,oe.meshPerAttribute);M.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=oe.meshPerAttribute*oe.count)}else for(let Ge=0;Ge<X.locationSize;Ge++)m(X.location+Ge);i.bindBuffer(i.ARRAY_BUFFER,$e);for(let Ge=0;Ge<X.locationSize;Ge++)y(X.location+Ge,pe/X.locationSize,q,he,Oe*ee,(Re+pe/X.locationSize*Ge)*ee,de)}else{if(ue.isInstancedBufferAttribute){for(let oe=0;oe<X.locationSize;oe++)p(X.location+oe,ue.meshPerAttribute);M.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=ue.meshPerAttribute*ue.count)}else for(let oe=0;oe<X.locationSize;oe++)m(X.location+oe);i.bindBuffer(i.ARRAY_BUFFER,$e);for(let oe=0;oe<X.locationSize;oe++)y(X.location+oe,pe/X.locationSize,q,he,pe*ee,pe/X.locationSize*oe*ee,de)}}else if(W!==void 0){const he=W[j];if(he!==void 0)switch(he.length){case 2:i.vertexAttrib2fv(X.location,he);break;case 3:i.vertexAttrib3fv(X.location,he);break;case 4:i.vertexAttrib4fv(X.location,he);break;default:i.vertexAttrib1fv(X.location,he)}}}}E()}function D(){U();for(const M in n){const P=n[M];for(const k in P){const B=P[k];for(const $ in B)u(B[$].object),delete B[$];delete P[k]}delete n[M]}}function R(M){if(n[M.id]===void 0)return;const P=n[M.id];for(const k in P){const B=P[k];for(const $ in B)u(B[$].object),delete B[$];delete P[k]}delete n[M.id]}function w(M){for(const P in n){const k=n[P];if(k[M.id]===void 0)continue;const B=k[M.id];for(const $ in B)u(B[$].object),delete B[$];delete k[M.id]}}function U(){b(),o=!0,r!==s&&(r=s,c(r.object))}function b(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:U,resetDefaultState:b,dispose:D,releaseStatesOfGeometry:R,releaseStatesOfProgram:w,initAttributes:v,enableAttribute:m,disableUnusedAttributes:E}}function qm(i,e,t){let n;function s(c){n=c}function r(c,u){i.drawArrays(n,c,u),t.update(u,n,1)}function o(c,u,h){h!==0&&(i.drawArraysInstanced(n,c,u,h),t.update(u,n,h))}function a(c,u,h){if(h===0)return;const d=e.get("WEBGL_multi_draw");if(d===null)for(let f=0;f<h;f++)this.render(c[f],u[f]);else{d.multiDrawArraysWEBGL(n,c,0,u,0,h);let f=0;for(let g=0;g<h;g++)f+=u[g];t.update(f,n,1)}}function l(c,u,h,d){if(h===0)return;const f=e.get("WEBGL_multi_draw");if(f===null)for(let g=0;g<c.length;g++)o(c[g],u[g],d[g]);else{f.multiDrawArraysInstancedWEBGL(n,c,0,u,0,d,0,h);let g=0;for(let v=0;v<h;v++)g+=u[v];for(let v=0;v<d.length;v++)t.update(g,n,d[v])}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function Ym(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){const R=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(R.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(R){return!(R!==pn&&n.convert(R)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(R){const w=R===Hn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(R!==Vn&&n.convert(R)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&R!==Tn&&!w)}function l(R){if(R==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";R="mediump"}return R==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const u=l(c);u!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);const h=t.logarithmicDepthBuffer===!0,d=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),f=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_TEXTURE_SIZE),v=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),m=i.getParameter(i.MAX_VERTEX_ATTRIBS),p=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),E=i.getParameter(i.MAX_VARYING_VECTORS),y=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),T=f>0,D=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:h,maxTextures:d,maxVertexTextures:f,maxTextureSize:g,maxCubemapSize:v,maxAttributes:m,maxVertexUniforms:p,maxVaryings:E,maxFragmentUniforms:y,vertexTextures:T,maxSamples:D}}function jm(i){const e=this;let t=null,n=0,s=!1,r=!1;const o=new Fn,a=new Ne,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,d){const f=h.length!==0||d||n!==0||s;return s=d,n=h.length,f},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(h,d){t=u(h,d,0)},this.setState=function(h,d,f){const g=h.clippingPlanes,v=h.clipIntersection,m=h.clipShadows,p=i.get(h);if(!s||g===null||g.length===0||r&&!m)r?u(null):c();else{const E=r?0:n,y=E*4;let T=p.clippingState||null;l.value=T,T=u(g,d,y,f);for(let D=0;D!==y;++D)T[D]=t[D];p.clippingState=T,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=E}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(h,d,f,g){const v=h!==null?h.length:0;let m=null;if(v!==0){if(m=l.value,g!==!0||m===null){const p=f+v*4,E=d.matrixWorldInverse;a.getNormalMatrix(E),(m===null||m.length<p)&&(m=new Float32Array(p));for(let y=0,T=f;y!==v;++y,T+=4)o.copy(h[y]).applyMatrix4(E,a),o.normal.toArray(m,T),m[T+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=v,e.numIntersection=0,m}}function Km(i){let e=new WeakMap;function t(o,a){return a===Ua?o.mapping=Xi:a===Na&&(o.mapping=$i),o}function n(o){if(o&&o.isTexture){const a=o.mapping;if(a===Ua||a===Na)if(e.has(o)){const l=e.get(o).texture;return t(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new of(l.height);return c.fromEquirectangularTexture(i,o),e.set(o,c),o.addEventListener("dispose",s),t(c.texture,o.mapping)}else return null}}return o}function s(o){const a=o.target;a.removeEventListener("dispose",s);const l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}class Tr extends Kc{constructor(e=-1,t=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-e,o=n+e,a=s+t,l=s-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=u*this.view.offsetY,l=a-u*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const Hi=4,yl=[.125,.215,.35,.446,.526,.582],ii=20,oa=new Tr,Ml=new Ee;let la=null,ca=0,ua=0,ha=!1;const ti=(1+Math.sqrt(5))/2,Ii=1/ti,Sl=[new C(-ti,Ii,0),new C(ti,Ii,0),new C(-Ii,0,ti),new C(Ii,0,ti),new C(0,ti,-Ii),new C(0,ti,Ii),new C(-1,1,-1),new C(1,1,-1),new C(-1,1,1),new C(1,1,1)];class bl{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,s=100){la=this._renderer.getRenderTarget(),ca=this._renderer.getActiveCubeFace(),ua=this._renderer.getActiveMipmapLevel(),ha=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(e,n,s,r),t>0&&this._blur(r,0,0,t),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=wl(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Tl(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(la,ca,ua),this._renderer.xr.enabled=ha,e.scissorTest=!1,Zs(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Xi||e.mapping===$i?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),la=this._renderer.getRenderTarget(),ca=this._renderer.getActiveCubeFace(),ua=this._renderer.getActiveMipmapLevel(),ha=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:rn,minFilter:rn,generateMipmaps:!1,type:Hn,format:pn,colorSpace:Wn,depthBuffer:!1},s=El(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=El(e,t,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Zm(r)),this._blurMaterial=Jm(r,e,t)}return s}_compileMaterial(e){const t=new be(this._lodPlanes[0],e);this._renderer.compile(t,oa)}_sceneToCubeUV(e,t,n,s){const a=new Jt(90,1,t,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],u=this._renderer,h=u.autoClear,d=u.toneMapping;u.getClearColor(Ml),u.toneMapping=kn,u.autoClear=!1;const f=new Wt({name:"PMREM.Background",side:Dt,depthWrite:!1,depthTest:!1}),g=new be(new xt,f);let v=!1;const m=e.background;m?m.isColor&&(f.color.copy(m),e.background=null,v=!0):(f.color.copy(Ml),v=!0);for(let p=0;p<6;p++){const E=p%3;E===0?(a.up.set(0,l[p],0),a.lookAt(c[p],0,0)):E===1?(a.up.set(0,0,l[p]),a.lookAt(0,c[p],0)):(a.up.set(0,l[p],0),a.lookAt(0,0,c[p]));const y=this._cubeSize;Zs(s,E*y,p>2?y:0,y,y),u.setRenderTarget(s),v&&u.render(g,a),u.render(e,a)}g.geometry.dispose(),g.material.dispose(),u.toneMapping=d,u.autoClear=h,e.background=m}_textureToCubeUV(e,t){const n=this._renderer,s=e.mapping===Xi||e.mapping===$i;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=wl()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Tl());const r=s?this._cubemapMaterial:this._equirectMaterial,o=new be(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=e;const l=this._cubeSize;Zs(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(o,oa)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const s=this._lodPlanes.length;for(let r=1;r<s;r++){const o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=Sl[(s-r-1)%Sl.length];this._blur(e,r-1,r,o,a)}t.autoClear=n}_blur(e,t,n,s,r){const o=this._pingPongRenderTarget;this._halfBlur(e,o,t,n,s,"latitudinal",r),this._halfBlur(o,e,n,n,s,"longitudinal",r)}_halfBlur(e,t,n,s,r,o,a){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const u=3,h=new be(this._lodPlanes[s],c),d=c.uniforms,f=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*ii-1),v=r/g,m=isFinite(r)?1+Math.floor(u*v):ii;m>ii&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${ii}`);const p=[];let E=0;for(let w=0;w<ii;++w){const U=w/v,b=Math.exp(-U*U/2);p.push(b),w===0?E+=b:w<m&&(E+=2*b)}for(let w=0;w<p.length;w++)p[w]=p[w]/E;d.envMap.value=e.texture,d.samples.value=m,d.weights.value=p,d.latitudinal.value=o==="latitudinal",a&&(d.poleAxis.value=a);const{_lodMax:y}=this;d.dTheta.value=g,d.mipInt.value=y-n;const T=this._sizeLods[s],D=3*T*(s>y-Hi?s-y+Hi:0),R=4*(this._cubeSize-T);Zs(t,D,R,3*T,2*T),l.setRenderTarget(t),l.render(h,oa)}}function Zm(i){const e=[],t=[],n=[];let s=i;const r=i-Hi+1+yl.length;for(let o=0;o<r;o++){const a=Math.pow(2,s);t.push(a);let l=1/a;o>i-Hi?l=yl[o-i+Hi-1]:o===0&&(l=0),n.push(l);const c=1/(a-2),u=-c,h=1+c,d=[u,u,h,u,h,h,u,u,h,h,u,h],f=6,g=6,v=3,m=2,p=1,E=new Float32Array(v*g*f),y=new Float32Array(m*g*f),T=new Float32Array(p*g*f);for(let R=0;R<f;R++){const w=R%3*2/3-1,U=R>2?0:-1,b=[w,U,0,w+2/3,U,0,w+2/3,U+1,0,w,U,0,w+2/3,U+1,0,w,U+1,0];E.set(b,v*g*R),y.set(d,m*g*R);const M=[R,R,R,R,R,R];T.set(M,p*g*R)}const D=new Ke;D.setAttribute("position",new Lt(E,v)),D.setAttribute("uv",new Lt(y,m)),D.setAttribute("faceIndex",new Lt(T,p)),e.push(D),s>Hi&&s--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function El(i,e,t){const n=new an(i,e,t);return n.texture.mapping=br,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Zs(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function Jm(i,e,t){const n=new Float32Array(ii),s=new C(0,1,0);return new Ct({name:"SphericalGaussianBlur",defines:{n:ii,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:to(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:An,depthTest:!1,depthWrite:!1})}function Tl(){return new Ct({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:to(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:An,depthTest:!1,depthWrite:!1})}function wl(){return new Ct({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:to(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:An,depthTest:!1,depthWrite:!1})}function to(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Qm(i){let e=new WeakMap,t=null;function n(a){if(a&&a.isTexture){const l=a.mapping,c=l===Ua||l===Na,u=l===Xi||l===$i;if(c||u){let h=e.get(a);const d=h!==void 0?h.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==d)return t===null&&(t=new bl(i)),h=c?t.fromEquirectangular(a,h):t.fromCubemap(a,h),h.texture.pmremVersion=a.pmremVersion,e.set(a,h),h.texture;if(h!==void 0)return h.texture;{const f=a.image;return c&&f&&f.height>0||u&&f&&s(f)?(t===null&&(t=new bl(i)),h=c?t.fromEquirectangular(a):t.fromCubemap(a),h.texture.pmremVersion=a.pmremVersion,e.set(a,h),a.addEventListener("dispose",r),h.texture):null}}}return a}function s(a){let l=0;const c=6;for(let u=0;u<c;u++)a[u]!==void 0&&l++;return l===c}function r(a){const l=a.target;l.removeEventListener("dispose",r);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:o}}function eg(i){const e={};function t(n){if(e[n]!==void 0)return e[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const s=t(n);return s===null&&Vc("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function tg(i,e,t,n){const s={},r=new WeakMap;function o(h){const d=h.target;d.index!==null&&e.remove(d.index);for(const g in d.attributes)e.remove(d.attributes[g]);for(const g in d.morphAttributes){const v=d.morphAttributes[g];for(let m=0,p=v.length;m<p;m++)e.remove(v[m])}d.removeEventListener("dispose",o),delete s[d.id];const f=r.get(d);f&&(e.remove(f),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function a(h,d){return s[d.id]===!0||(d.addEventListener("dispose",o),s[d.id]=!0,t.memory.geometries++),d}function l(h){const d=h.attributes;for(const g in d)e.update(d[g],i.ARRAY_BUFFER);const f=h.morphAttributes;for(const g in f){const v=f[g];for(let m=0,p=v.length;m<p;m++)e.update(v[m],i.ARRAY_BUFFER)}}function c(h){const d=[],f=h.index,g=h.attributes.position;let v=0;if(f!==null){const E=f.array;v=f.version;for(let y=0,T=E.length;y<T;y+=3){const D=E[y+0],R=E[y+1],w=E[y+2];d.push(D,R,R,w,w,D)}}else if(g!==void 0){const E=g.array;v=g.version;for(let y=0,T=E.length/3-1;y<T;y+=3){const D=y+0,R=y+1,w=y+2;d.push(D,R,R,w,w,D)}}else return;const m=new(Gc(d)?Yc:qc)(d,1);m.version=v;const p=r.get(h);p&&e.remove(p),r.set(h,m)}function u(h){const d=r.get(h);if(d){const f=h.index;f!==null&&d.version<f.version&&c(h)}else c(h);return r.get(h)}return{get:a,update:l,getWireframeAttribute:u}}function ng(i,e,t){let n;function s(d){n=d}let r,o;function a(d){r=d.type,o=d.bytesPerElement}function l(d,f){i.drawElements(n,f,r,d*o),t.update(f,n,1)}function c(d,f,g){g!==0&&(i.drawElementsInstanced(n,f,r,d*o,g),t.update(f,n,g))}function u(d,f,g){if(g===0)return;const v=e.get("WEBGL_multi_draw");if(v===null)for(let m=0;m<g;m++)this.render(d[m]/o,f[m]);else{v.multiDrawElementsWEBGL(n,f,0,r,d,0,g);let m=0;for(let p=0;p<g;p++)m+=f[p];t.update(m,n,1)}}function h(d,f,g,v){if(g===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<d.length;p++)c(d[p]/o,f[p],v[p]);else{m.multiDrawElementsInstancedWEBGL(n,f,0,r,d,0,v,0,g);let p=0;for(let E=0;E<g;E++)p+=f[E];for(let E=0;E<v.length;E++)t.update(p,n,v[E])}}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=u,this.renderMultiDrawInstances=h}function ig(i){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(t.calls++,o){case i.TRIANGLES:t.triangles+=a*(r/3);break;case i.LINES:t.lines+=a*(r/2);break;case i.LINE_STRIP:t.lines+=a*(r-1);break;case i.LINE_LOOP:t.lines+=a*r;break;case i.POINTS:t.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function sg(i,e,t){const n=new WeakMap,s=new rt;function r(o,a,l){const c=o.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,h=u!==void 0?u.length:0;let d=n.get(a);if(d===void 0||d.count!==h){let M=function(){U.dispose(),n.delete(a),a.removeEventListener("dispose",M)};var f=M;d!==void 0&&d.texture.dispose();const g=a.morphAttributes.position!==void 0,v=a.morphAttributes.normal!==void 0,m=a.morphAttributes.color!==void 0,p=a.morphAttributes.position||[],E=a.morphAttributes.normal||[],y=a.morphAttributes.color||[];let T=0;g===!0&&(T=1),v===!0&&(T=2),m===!0&&(T=3);let D=a.attributes.position.count*T,R=1;D>e.maxTextureSize&&(R=Math.ceil(D/e.maxTextureSize),D=e.maxTextureSize);const w=new Float32Array(D*R*4*h),U=new Xc(w,D,R,h);U.type=Tn,U.needsUpdate=!0;const b=T*4;for(let P=0;P<h;P++){const k=p[P],B=E[P],$=y[P],Y=D*R*4*P;for(let W=0;W<k.count;W++){const j=W*b;g===!0&&(s.fromBufferAttribute(k,W),w[Y+j+0]=s.x,w[Y+j+1]=s.y,w[Y+j+2]=s.z,w[Y+j+3]=0),v===!0&&(s.fromBufferAttribute(B,W),w[Y+j+4]=s.x,w[Y+j+5]=s.y,w[Y+j+6]=s.z,w[Y+j+7]=0),m===!0&&(s.fromBufferAttribute($,W),w[Y+j+8]=s.x,w[Y+j+9]=s.y,w[Y+j+10]=s.z,w[Y+j+11]=$.itemSize===4?s.w:1)}}d={count:h,texture:U,size:new ie(D,R)},n.set(a,d),a.addEventListener("dispose",M)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",o.morphTexture,t);else{let g=0;for(let m=0;m<c.length;m++)g+=c[m];const v=a.morphTargetsRelative?1:1-g;l.getUniforms().setValue(i,"morphTargetBaseInfluence",v),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",d.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",d.size)}return{update:r}}function rg(i,e,t,n){let s=new WeakMap;function r(l){const c=n.render.frame,u=l.geometry,h=e.get(l,u);if(s.get(h)!==c&&(e.update(h),s.set(h,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),s.get(l)!==c&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){const d=l.skeleton;s.get(d)!==c&&(d.update(),s.set(d,c))}return h}function o(){s=new WeakMap}function a(l){const c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:r,dispose:o}}class Qc extends It{constructor(e,t,n,s,r,o,a,l,c,u=Vi){if(u!==Vi&&u!==ji)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&u===Vi&&(n=qi),n===void 0&&u===ji&&(n=Yi),super(null,s,r,o,a,l,u,n,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=a!==void 0?a:Bt,this.minFilter=l!==void 0?l:Bt,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const eu=new It,tu=new Qc(1,1);tu.compareFunction=Hc;const nu=new Xc,iu=new Xd,su=new Zc,Al=[],Cl=[],Rl=new Float32Array(16),Pl=new Float32Array(9),Ll=new Float32Array(4);function Ji(i,e,t){const n=i[0];if(n<=0||n>0)return i;const s=e*t;let r=Al[s];if(r===void 0&&(r=new Float32Array(s),Al[s]=r),e!==0){n.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,i[o].toArray(r,a)}return r}function yt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function Mt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function wr(i,e){let t=Cl[e];t===void 0&&(t=new Int32Array(e),Cl[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function ag(i,e){const t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function og(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(yt(t,e))return;i.uniform2fv(this.addr,e),Mt(t,e)}}function lg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(yt(t,e))return;i.uniform3fv(this.addr,e),Mt(t,e)}}function cg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(yt(t,e))return;i.uniform4fv(this.addr,e),Mt(t,e)}}function ug(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(yt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),Mt(t,e)}else{if(yt(t,n))return;Ll.set(n),i.uniformMatrix2fv(this.addr,!1,Ll),Mt(t,n)}}function hg(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(yt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),Mt(t,e)}else{if(yt(t,n))return;Pl.set(n),i.uniformMatrix3fv(this.addr,!1,Pl),Mt(t,n)}}function dg(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(yt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),Mt(t,e)}else{if(yt(t,n))return;Rl.set(n),i.uniformMatrix4fv(this.addr,!1,Rl),Mt(t,n)}}function fg(i,e){const t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function pg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(yt(t,e))return;i.uniform2iv(this.addr,e),Mt(t,e)}}function mg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(yt(t,e))return;i.uniform3iv(this.addr,e),Mt(t,e)}}function gg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(yt(t,e))return;i.uniform4iv(this.addr,e),Mt(t,e)}}function _g(i,e){const t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function vg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(yt(t,e))return;i.uniform2uiv(this.addr,e),Mt(t,e)}}function xg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(yt(t,e))return;i.uniform3uiv(this.addr,e),Mt(t,e)}}function yg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(yt(t,e))return;i.uniform4uiv(this.addr,e),Mt(t,e)}}function Mg(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);const r=this.type===i.SAMPLER_2D_SHADOW?tu:eu;t.setTexture2D(e||r,s)}function Sg(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||iu,s)}function bg(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||su,s)}function Eg(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||nu,s)}function Tg(i){switch(i){case 5126:return ag;case 35664:return og;case 35665:return lg;case 35666:return cg;case 35674:return ug;case 35675:return hg;case 35676:return dg;case 5124:case 35670:return fg;case 35667:case 35671:return pg;case 35668:case 35672:return mg;case 35669:case 35673:return gg;case 5125:return _g;case 36294:return vg;case 36295:return xg;case 36296:return yg;case 35678:case 36198:case 36298:case 36306:case 35682:return Mg;case 35679:case 36299:case 36307:return Sg;case 35680:case 36300:case 36308:case 36293:return bg;case 36289:case 36303:case 36311:case 36292:return Eg}}function wg(i,e){i.uniform1fv(this.addr,e)}function Ag(i,e){const t=Ji(e,this.size,2);i.uniform2fv(this.addr,t)}function Cg(i,e){const t=Ji(e,this.size,3);i.uniform3fv(this.addr,t)}function Rg(i,e){const t=Ji(e,this.size,4);i.uniform4fv(this.addr,t)}function Pg(i,e){const t=Ji(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function Lg(i,e){const t=Ji(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function Dg(i,e){const t=Ji(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function Ig(i,e){i.uniform1iv(this.addr,e)}function Ug(i,e){i.uniform2iv(this.addr,e)}function Ng(i,e){i.uniform3iv(this.addr,e)}function Og(i,e){i.uniform4iv(this.addr,e)}function Fg(i,e){i.uniform1uiv(this.addr,e)}function Bg(i,e){i.uniform2uiv(this.addr,e)}function zg(i,e){i.uniform3uiv(this.addr,e)}function kg(i,e){i.uniform4uiv(this.addr,e)}function Hg(i,e,t){const n=this.cache,s=e.length,r=wr(t,s);yt(n,r)||(i.uniform1iv(this.addr,r),Mt(n,r));for(let o=0;o!==s;++o)t.setTexture2D(e[o]||eu,r[o])}function Gg(i,e,t){const n=this.cache,s=e.length,r=wr(t,s);yt(n,r)||(i.uniform1iv(this.addr,r),Mt(n,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||iu,r[o])}function Vg(i,e,t){const n=this.cache,s=e.length,r=wr(t,s);yt(n,r)||(i.uniform1iv(this.addr,r),Mt(n,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||su,r[o])}function Wg(i,e,t){const n=this.cache,s=e.length,r=wr(t,s);yt(n,r)||(i.uniform1iv(this.addr,r),Mt(n,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||nu,r[o])}function Xg(i){switch(i){case 5126:return wg;case 35664:return Ag;case 35665:return Cg;case 35666:return Rg;case 35674:return Pg;case 35675:return Lg;case 35676:return Dg;case 5124:case 35670:return Ig;case 35667:case 35671:return Ug;case 35668:case 35672:return Ng;case 35669:case 35673:return Og;case 5125:return Fg;case 36294:return Bg;case 36295:return zg;case 36296:return kg;case 35678:case 36198:case 36298:case 36306:case 35682:return Hg;case 35679:case 36299:case 36307:return Gg;case 35680:case 36300:case 36308:case 36293:return Vg;case 36289:case 36303:case 36311:case 36292:return Wg}}class $g{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Tg(t.type)}}class qg{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Xg(t.type)}}class Yg{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const s=this.seq;for(let r=0,o=s.length;r!==o;++r){const a=s[r];a.setValue(e,t[a.id],n)}}}const da=/(\w+)(\])?(\[|\.)?/g;function Dl(i,e){i.seq.push(e),i.map[e.id]=e}function jg(i,e,t){const n=i.name,s=n.length;for(da.lastIndex=0;;){const r=da.exec(n),o=da.lastIndex;let a=r[1];const l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){Dl(t,c===void 0?new $g(a,i,e):new qg(a,i,e));break}else{let h=t.map[a];h===void 0&&(h=new Yg(a),Dl(t,h)),t=h}}}class lr{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){const r=e.getActiveUniform(t,s),o=e.getUniformLocation(t,r.name);jg(r,o,this)}}setValue(e,t,n,s){const r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){const s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,o=t.length;r!==o;++r){const a=t[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,s)}}static seqWithValue(e,t){const n=[];for(let s=0,r=e.length;s!==r;++s){const o=e[s];o.id in t&&n.push(o)}return n}}function Il(i,e,t){const n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}const Kg=37297;let Zg=0;function Jg(i,e){const t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){const a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}function Qg(i){const e=Ze.getPrimaries(Ze.workingColorSpace),t=Ze.getPrimaries(i);let n;switch(e===t?n="":e===pr&&t===fr?n="LinearDisplayP3ToLinearSRGB":e===fr&&t===pr&&(n="LinearSRGBToLinearDisplayP3"),i){case Wn:case Er:return[n,"LinearTransferOETF"];case Kt:case Ja:return[n,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",i),[n,"LinearTransferOETF"]}}function Ul(i,e,t){const n=i.getShaderParameter(e,i.COMPILE_STATUS),s=i.getShaderInfoLog(e).trim();if(n&&s==="")return"";const r=/ERROR: 0:(\d+)/.exec(s);if(r){const o=parseInt(r[1]);return t.toUpperCase()+`

`+s+`

`+Jg(i.getShaderSource(e),o)}else return s}function e0(i,e){const t=Qg(e);return`vec4 ${i}( vec4 value ) { return ${t[0]}( ${t[1]}( value ) ); }`}function t0(i,e){let t;switch(e){case Ac:t="Linear";break;case Cc:t="Reinhard";break;case Rc:t="OptimizedCineon";break;case Za:t="ACESFilmic";break;case Pc:t="AgX";break;case Lc:t="Neutral";break;case md:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}function n0(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(cs).join(`
`)}function i0(i){const e=[];for(const t in i){const n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function s0(i,e){const t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(e,s),o=r.name;let a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:i.getAttribLocation(e,o),locationSize:a}}return t}function cs(i){return i!==""}function Nl(i,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Ol(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const r0=/^[ \t]*#include +<([\w\d./]+)>/gm;function Ba(i){return i.replace(r0,o0)}const a0=new Map;function o0(i,e){let t=Ue[e];if(t===void 0){const n=a0.get(e);if(n!==void 0)t=Ue[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return Ba(t)}const l0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Fl(i){return i.replace(l0,c0)}function c0(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Bl(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function u0(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===Ec?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===Tc?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===bn&&(e="SHADOWMAP_TYPE_VSM"),e}function h0(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case Xi:case $i:e="ENVMAP_TYPE_CUBE";break;case br:e="ENVMAP_TYPE_CUBE_UV";break}return e}function d0(i){let e="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case $i:e="ENVMAP_MODE_REFRACTION";break}return e}function f0(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case wc:e="ENVMAP_BLENDING_MULTIPLY";break;case fd:e="ENVMAP_BLENDING_MIX";break;case pd:e="ENVMAP_BLENDING_ADD";break}return e}function p0(i){const e=i.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:n,maxMip:t}}function m0(i,e,t,n){const s=i.getContext(),r=t.defines;let o=t.vertexShader,a=t.fragmentShader;const l=u0(t),c=h0(t),u=d0(t),h=f0(t),d=p0(t),f=n0(t),g=i0(r),v=s.createProgram();let m,p,E=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(cs).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(cs).join(`
`),p.length>0&&(p+=`
`)):(m=[Bl(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(cs).join(`
`),p=[Bl(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+h:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==kn?"#define TONE_MAPPING":"",t.toneMapping!==kn?Ue.tonemapping_pars_fragment:"",t.toneMapping!==kn?t0("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Ue.colorspace_pars_fragment,e0("linearToOutputTexel",t.outputColorSpace),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(cs).join(`
`)),o=Ba(o),o=Nl(o,t),o=Ol(o,t),a=Ba(a),a=Nl(a,t),a=Ol(a,t),o=Fl(o),a=Fl(a),t.isRawShaderMaterial!==!0&&(E=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",t.glslVersion===el?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===el?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const y=E+m+o,T=E+p+a,D=Il(s,s.VERTEX_SHADER,y),R=Il(s,s.FRAGMENT_SHADER,T);s.attachShader(v,D),s.attachShader(v,R),t.index0AttributeName!==void 0?s.bindAttribLocation(v,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(v,0,"position"),s.linkProgram(v);function w(P){if(i.debug.checkShaderErrors){const k=s.getProgramInfoLog(v).trim(),B=s.getShaderInfoLog(D).trim(),$=s.getShaderInfoLog(R).trim();let Y=!0,W=!0;if(s.getProgramParameter(v,s.LINK_STATUS)===!1)if(Y=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,v,D,R);else{const j=Ul(s,D,"vertex"),X=Ul(s,R,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(v,s.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+k+`
`+j+`
`+X)}else k!==""?console.warn("THREE.WebGLProgram: Program Info Log:",k):(B===""||$==="")&&(W=!1);W&&(P.diagnostics={runnable:Y,programLog:k,vertexShader:{log:B,prefix:m},fragmentShader:{log:$,prefix:p}})}s.deleteShader(D),s.deleteShader(R),U=new lr(s,v),b=s0(s,v)}let U;this.getUniforms=function(){return U===void 0&&w(this),U};let b;this.getAttributes=function(){return b===void 0&&w(this),b};let M=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return M===!1&&(M=s.getProgramParameter(v,Kg)),M},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(v),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Zg++,this.cacheKey=e,this.usedTimes=1,this.program=v,this.vertexShader=D,this.fragmentShader=R,this}let g0=0;class _0{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(n),o=this._getShaderCacheForMaterial(e);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new v0(e),t.set(e,n)),n}}class v0{constructor(e){this.id=g0++,this.code=e,this.usedTimes=0}}function x0(i,e,t,n,s,r,o){const a=new Qa,l=new _0,c=new Set,u=[],h=s.logarithmicDepthBuffer,d=s.vertexTextures;let f=s.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function v(b){return c.add(b),b===0?"uv":`uv${b}`}function m(b,M,P,k,B){const $=k.fog,Y=B.geometry,W=b.isMeshStandardMaterial?k.environment:null,j=(b.isMeshStandardMaterial?t:e).get(b.envMap||W),X=j&&j.mapping===br?j.image.height:null,ue=g[b.type];b.precision!==null&&(f=s.getMaxPrecision(b.precision),f!==b.precision&&console.warn("THREE.WebGLProgram.getParameters:",b.precision,"not supported, using",f,"instead."));const he=Y.morphAttributes.position||Y.morphAttributes.normal||Y.morphAttributes.color,pe=he!==void 0?he.length:0;let He=0;Y.morphAttributes.position!==void 0&&(He=1),Y.morphAttributes.normal!==void 0&&(He=2),Y.morphAttributes.color!==void 0&&(He=3);let $e,q,ee,de;if(ue){const qe=dn[ue];$e=qe.vertexShader,q=qe.fragmentShader}else $e=b.vertexShader,q=b.fragmentShader,l.update(b),ee=l.getVertexShaderID(b),de=l.getFragmentShaderID(b);const oe=i.getRenderTarget(),Oe=B.isInstancedMesh===!0,Re=B.isBatchedMesh===!0,Ge=!!b.map,L=!!b.matcap,Ve=!!j,ke=!!b.aoMap,it=!!b.lightMap,Me=!!b.bumpMap,Xe=!!b.normalMap,Fe=!!b.displacementMap,Pe=!!b.emissiveMap,at=!!b.metalnessMap,A=!!b.roughnessMap,x=b.anisotropy>0,H=b.clearcoat>0,K=b.dispersion>0,J=b.iridescence>0,Q=b.sheen>0,_e=b.transmission>0,re=x&&!!b.anisotropyMap,se=H&&!!b.clearcoatMap,Le=H&&!!b.clearcoatNormalMap,te=H&&!!b.clearcoatRoughnessMap,me=J&&!!b.iridescenceMap,ze=J&&!!b.iridescenceThicknessMap,Te=Q&&!!b.sheenColorMap,le=Q&&!!b.sheenRoughnessMap,De=!!b.specularMap,Ie=!!b.specularColorMap,ot=!!b.specularIntensityMap,_=_e&&!!b.transmissionMap,G=_e&&!!b.thicknessMap,O=!!b.gradientMap,V=!!b.alphaMap,Z=b.alphaTest>0,ve=!!b.alphaHash,Ce=!!b.extensions;let lt=kn;b.toneMapped&&(oe===null||oe.isXRRenderTarget===!0)&&(lt=i.toneMapping);const pt={shaderID:ue,shaderType:b.type,shaderName:b.name,vertexShader:$e,fragmentShader:q,defines:b.defines,customVertexShaderID:ee,customFragmentShaderID:de,isRawShaderMaterial:b.isRawShaderMaterial===!0,glslVersion:b.glslVersion,precision:f,batching:Re,batchingColor:Re&&B._colorsTexture!==null,instancing:Oe,instancingColor:Oe&&B.instanceColor!==null,instancingMorph:Oe&&B.morphTexture!==null,supportsVertexTextures:d,outputColorSpace:oe===null?i.outputColorSpace:oe.isXRRenderTarget===!0?oe.texture.colorSpace:Wn,alphaToCoverage:!!b.alphaToCoverage,map:Ge,matcap:L,envMap:Ve,envMapMode:Ve&&j.mapping,envMapCubeUVHeight:X,aoMap:ke,lightMap:it,bumpMap:Me,normalMap:Xe,displacementMap:d&&Fe,emissiveMap:Pe,normalMapObjectSpace:Xe&&b.normalMapType===Cd,normalMapTangentSpace:Xe&&b.normalMapType===kc,metalnessMap:at,roughnessMap:A,anisotropy:x,anisotropyMap:re,clearcoat:H,clearcoatMap:se,clearcoatNormalMap:Le,clearcoatRoughnessMap:te,dispersion:K,iridescence:J,iridescenceMap:me,iridescenceThicknessMap:ze,sheen:Q,sheenColorMap:Te,sheenRoughnessMap:le,specularMap:De,specularColorMap:Ie,specularIntensityMap:ot,transmission:_e,transmissionMap:_,thicknessMap:G,gradientMap:O,opaque:b.transparent===!1&&b.blending===Gi&&b.alphaToCoverage===!1,alphaMap:V,alphaTest:Z,alphaHash:ve,combine:b.combine,mapUv:Ge&&v(b.map.channel),aoMapUv:ke&&v(b.aoMap.channel),lightMapUv:it&&v(b.lightMap.channel),bumpMapUv:Me&&v(b.bumpMap.channel),normalMapUv:Xe&&v(b.normalMap.channel),displacementMapUv:Fe&&v(b.displacementMap.channel),emissiveMapUv:Pe&&v(b.emissiveMap.channel),metalnessMapUv:at&&v(b.metalnessMap.channel),roughnessMapUv:A&&v(b.roughnessMap.channel),anisotropyMapUv:re&&v(b.anisotropyMap.channel),clearcoatMapUv:se&&v(b.clearcoatMap.channel),clearcoatNormalMapUv:Le&&v(b.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:te&&v(b.clearcoatRoughnessMap.channel),iridescenceMapUv:me&&v(b.iridescenceMap.channel),iridescenceThicknessMapUv:ze&&v(b.iridescenceThicknessMap.channel),sheenColorMapUv:Te&&v(b.sheenColorMap.channel),sheenRoughnessMapUv:le&&v(b.sheenRoughnessMap.channel),specularMapUv:De&&v(b.specularMap.channel),specularColorMapUv:Ie&&v(b.specularColorMap.channel),specularIntensityMapUv:ot&&v(b.specularIntensityMap.channel),transmissionMapUv:_&&v(b.transmissionMap.channel),thicknessMapUv:G&&v(b.thicknessMap.channel),alphaMapUv:V&&v(b.alphaMap.channel),vertexTangents:!!Y.attributes.tangent&&(Xe||x),vertexColors:b.vertexColors,vertexAlphas:b.vertexColors===!0&&!!Y.attributes.color&&Y.attributes.color.itemSize===4,pointsUvs:B.isPoints===!0&&!!Y.attributes.uv&&(Ge||V),fog:!!$,useFog:b.fog===!0,fogExp2:!!$&&$.isFogExp2,flatShading:b.flatShading===!0,sizeAttenuation:b.sizeAttenuation===!0,logarithmicDepthBuffer:h,skinning:B.isSkinnedMesh===!0,morphTargets:Y.morphAttributes.position!==void 0,morphNormals:Y.morphAttributes.normal!==void 0,morphColors:Y.morphAttributes.color!==void 0,morphTargetsCount:pe,morphTextureStride:He,numDirLights:M.directional.length,numPointLights:M.point.length,numSpotLights:M.spot.length,numSpotLightMaps:M.spotLightMap.length,numRectAreaLights:M.rectArea.length,numHemiLights:M.hemi.length,numDirLightShadows:M.directionalShadowMap.length,numPointLightShadows:M.pointShadowMap.length,numSpotLightShadows:M.spotShadowMap.length,numSpotLightShadowsWithMaps:M.numSpotLightShadowsWithMaps,numLightProbes:M.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:b.dithering,shadowMapEnabled:i.shadowMap.enabled&&P.length>0,shadowMapType:i.shadowMap.type,toneMapping:lt,decodeVideoTexture:Ge&&b.map.isVideoTexture===!0&&Ze.getTransfer(b.map.colorSpace)===st,premultipliedAlpha:b.premultipliedAlpha,doubleSided:b.side===$t,flipSided:b.side===Dt,useDepthPacking:b.depthPacking>=0,depthPacking:b.depthPacking||0,index0AttributeName:b.index0AttributeName,extensionClipCullDistance:Ce&&b.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:Ce&&b.extensions.multiDraw===!0&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:b.customProgramCacheKey()};return pt.vertexUv1s=c.has(1),pt.vertexUv2s=c.has(2),pt.vertexUv3s=c.has(3),c.clear(),pt}function p(b){const M=[];if(b.shaderID?M.push(b.shaderID):(M.push(b.customVertexShaderID),M.push(b.customFragmentShaderID)),b.defines!==void 0)for(const P in b.defines)M.push(P),M.push(b.defines[P]);return b.isRawShaderMaterial===!1&&(E(M,b),y(M,b),M.push(i.outputColorSpace)),M.push(b.customProgramCacheKey),M.join()}function E(b,M){b.push(M.precision),b.push(M.outputColorSpace),b.push(M.envMapMode),b.push(M.envMapCubeUVHeight),b.push(M.mapUv),b.push(M.alphaMapUv),b.push(M.lightMapUv),b.push(M.aoMapUv),b.push(M.bumpMapUv),b.push(M.normalMapUv),b.push(M.displacementMapUv),b.push(M.emissiveMapUv),b.push(M.metalnessMapUv),b.push(M.roughnessMapUv),b.push(M.anisotropyMapUv),b.push(M.clearcoatMapUv),b.push(M.clearcoatNormalMapUv),b.push(M.clearcoatRoughnessMapUv),b.push(M.iridescenceMapUv),b.push(M.iridescenceThicknessMapUv),b.push(M.sheenColorMapUv),b.push(M.sheenRoughnessMapUv),b.push(M.specularMapUv),b.push(M.specularColorMapUv),b.push(M.specularIntensityMapUv),b.push(M.transmissionMapUv),b.push(M.thicknessMapUv),b.push(M.combine),b.push(M.fogExp2),b.push(M.sizeAttenuation),b.push(M.morphTargetsCount),b.push(M.morphAttributeCount),b.push(M.numDirLights),b.push(M.numPointLights),b.push(M.numSpotLights),b.push(M.numSpotLightMaps),b.push(M.numHemiLights),b.push(M.numRectAreaLights),b.push(M.numDirLightShadows),b.push(M.numPointLightShadows),b.push(M.numSpotLightShadows),b.push(M.numSpotLightShadowsWithMaps),b.push(M.numLightProbes),b.push(M.shadowMapType),b.push(M.toneMapping),b.push(M.numClippingPlanes),b.push(M.numClipIntersection),b.push(M.depthPacking)}function y(b,M){a.disableAll(),M.supportsVertexTextures&&a.enable(0),M.instancing&&a.enable(1),M.instancingColor&&a.enable(2),M.instancingMorph&&a.enable(3),M.matcap&&a.enable(4),M.envMap&&a.enable(5),M.normalMapObjectSpace&&a.enable(6),M.normalMapTangentSpace&&a.enable(7),M.clearcoat&&a.enable(8),M.iridescence&&a.enable(9),M.alphaTest&&a.enable(10),M.vertexColors&&a.enable(11),M.vertexAlphas&&a.enable(12),M.vertexUv1s&&a.enable(13),M.vertexUv2s&&a.enable(14),M.vertexUv3s&&a.enable(15),M.vertexTangents&&a.enable(16),M.anisotropy&&a.enable(17),M.alphaHash&&a.enable(18),M.batching&&a.enable(19),M.dispersion&&a.enable(20),M.batchingColor&&a.enable(21),b.push(a.mask),a.disableAll(),M.fog&&a.enable(0),M.useFog&&a.enable(1),M.flatShading&&a.enable(2),M.logarithmicDepthBuffer&&a.enable(3),M.skinning&&a.enable(4),M.morphTargets&&a.enable(5),M.morphNormals&&a.enable(6),M.morphColors&&a.enable(7),M.premultipliedAlpha&&a.enable(8),M.shadowMapEnabled&&a.enable(9),M.doubleSided&&a.enable(10),M.flipSided&&a.enable(11),M.useDepthPacking&&a.enable(12),M.dithering&&a.enable(13),M.transmission&&a.enable(14),M.sheen&&a.enable(15),M.opaque&&a.enable(16),M.pointsUvs&&a.enable(17),M.decodeVideoTexture&&a.enable(18),M.alphaToCoverage&&a.enable(19),b.push(a.mask)}function T(b){const M=g[b.type];let P;if(M){const k=dn[M];P=ys.clone(k.uniforms)}else P=b.uniforms;return P}function D(b,M){let P;for(let k=0,B=u.length;k<B;k++){const $=u[k];if($.cacheKey===M){P=$,++P.usedTimes;break}}return P===void 0&&(P=new m0(i,M,b,r),u.push(P)),P}function R(b){if(--b.usedTimes===0){const M=u.indexOf(b);u[M]=u[u.length-1],u.pop(),b.destroy()}}function w(b){l.remove(b)}function U(){l.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:T,acquireProgram:D,releaseProgram:R,releaseShaderCache:w,programs:u,dispose:U}}function y0(){let i=new WeakMap;function e(r){let o=i.get(r);return o===void 0&&(o={},i.set(r,o)),o}function t(r){i.delete(r)}function n(r,o,a){i.get(r)[o]=a}function s(){i=new WeakMap}return{get:e,remove:t,update:n,dispose:s}}function M0(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function zl(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function kl(){const i=[];let e=0;const t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function o(h,d,f,g,v,m){let p=i[e];return p===void 0?(p={id:h.id,object:h,geometry:d,material:f,groupOrder:g,renderOrder:h.renderOrder,z:v,group:m},i[e]=p):(p.id=h.id,p.object=h,p.geometry=d,p.material=f,p.groupOrder=g,p.renderOrder=h.renderOrder,p.z=v,p.group=m),e++,p}function a(h,d,f,g,v,m){const p=o(h,d,f,g,v,m);f.transmission>0?n.push(p):f.transparent===!0?s.push(p):t.push(p)}function l(h,d,f,g,v,m){const p=o(h,d,f,g,v,m);f.transmission>0?n.unshift(p):f.transparent===!0?s.unshift(p):t.unshift(p)}function c(h,d){t.length>1&&t.sort(h||M0),n.length>1&&n.sort(d||zl),s.length>1&&s.sort(d||zl)}function u(){for(let h=e,d=i.length;h<d;h++){const f=i[h];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:a,unshift:l,finish:u,sort:c}}function S0(){let i=new WeakMap;function e(n,s){const r=i.get(n);let o;return r===void 0?(o=new kl,i.set(n,[o])):s>=r.length?(o=new kl,r.push(o)):o=r[s],o}function t(){i=new WeakMap}return{get:e,dispose:t}}function b0(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new C,color:new Ee};break;case"SpotLight":t={position:new C,direction:new C,color:new Ee,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new C,color:new Ee,distance:0,decay:0};break;case"HemisphereLight":t={direction:new C,skyColor:new Ee,groundColor:new Ee};break;case"RectAreaLight":t={color:new Ee,position:new C,halfWidth:new C,halfHeight:new C};break}return i[e.id]=t,t}}}function E0(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ie};break;case"SpotLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ie};break;case"PointLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ie,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}let T0=0;function w0(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function A0(i){const e=new b0,t=E0(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new C);const s=new C,r=new et,o=new et;function a(c){let u=0,h=0,d=0;for(let b=0;b<9;b++)n.probe[b].set(0,0,0);let f=0,g=0,v=0,m=0,p=0,E=0,y=0,T=0,D=0,R=0,w=0;c.sort(w0);for(let b=0,M=c.length;b<M;b++){const P=c[b],k=P.color,B=P.intensity,$=P.distance,Y=P.shadow&&P.shadow.map?P.shadow.map.texture:null;if(P.isAmbientLight)u+=k.r*B,h+=k.g*B,d+=k.b*B;else if(P.isLightProbe){for(let W=0;W<9;W++)n.probe[W].addScaledVector(P.sh.coefficients[W],B);w++}else if(P.isDirectionalLight){const W=e.get(P);if(W.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){const j=P.shadow,X=t.get(P);X.shadowBias=j.bias,X.shadowNormalBias=j.normalBias,X.shadowRadius=j.radius,X.shadowMapSize=j.mapSize,n.directionalShadow[f]=X,n.directionalShadowMap[f]=Y,n.directionalShadowMatrix[f]=P.shadow.matrix,E++}n.directional[f]=W,f++}else if(P.isSpotLight){const W=e.get(P);W.position.setFromMatrixPosition(P.matrixWorld),W.color.copy(k).multiplyScalar(B),W.distance=$,W.coneCos=Math.cos(P.angle),W.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),W.decay=P.decay,n.spot[v]=W;const j=P.shadow;if(P.map&&(n.spotLightMap[D]=P.map,D++,j.updateMatrices(P),P.castShadow&&R++),n.spotLightMatrix[v]=j.matrix,P.castShadow){const X=t.get(P);X.shadowBias=j.bias,X.shadowNormalBias=j.normalBias,X.shadowRadius=j.radius,X.shadowMapSize=j.mapSize,n.spotShadow[v]=X,n.spotShadowMap[v]=Y,T++}v++}else if(P.isRectAreaLight){const W=e.get(P);W.color.copy(k).multiplyScalar(B),W.halfWidth.set(P.width*.5,0,0),W.halfHeight.set(0,P.height*.5,0),n.rectArea[m]=W,m++}else if(P.isPointLight){const W=e.get(P);if(W.color.copy(P.color).multiplyScalar(P.intensity),W.distance=P.distance,W.decay=P.decay,P.castShadow){const j=P.shadow,X=t.get(P);X.shadowBias=j.bias,X.shadowNormalBias=j.normalBias,X.shadowRadius=j.radius,X.shadowMapSize=j.mapSize,X.shadowCameraNear=j.camera.near,X.shadowCameraFar=j.camera.far,n.pointShadow[g]=X,n.pointShadowMap[g]=Y,n.pointShadowMatrix[g]=P.shadow.matrix,y++}n.point[g]=W,g++}else if(P.isHemisphereLight){const W=e.get(P);W.skyColor.copy(P.color).multiplyScalar(B),W.groundColor.copy(P.groundColor).multiplyScalar(B),n.hemi[p]=W,p++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ae.LTC_FLOAT_1,n.rectAreaLTC2=ae.LTC_FLOAT_2):(n.rectAreaLTC1=ae.LTC_HALF_1,n.rectAreaLTC2=ae.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=h,n.ambient[2]=d;const U=n.hash;(U.directionalLength!==f||U.pointLength!==g||U.spotLength!==v||U.rectAreaLength!==m||U.hemiLength!==p||U.numDirectionalShadows!==E||U.numPointShadows!==y||U.numSpotShadows!==T||U.numSpotMaps!==D||U.numLightProbes!==w)&&(n.directional.length=f,n.spot.length=v,n.rectArea.length=m,n.point.length=g,n.hemi.length=p,n.directionalShadow.length=E,n.directionalShadowMap.length=E,n.pointShadow.length=y,n.pointShadowMap.length=y,n.spotShadow.length=T,n.spotShadowMap.length=T,n.directionalShadowMatrix.length=E,n.pointShadowMatrix.length=y,n.spotLightMatrix.length=T+D-R,n.spotLightMap.length=D,n.numSpotLightShadowsWithMaps=R,n.numLightProbes=w,U.directionalLength=f,U.pointLength=g,U.spotLength=v,U.rectAreaLength=m,U.hemiLength=p,U.numDirectionalShadows=E,U.numPointShadows=y,U.numSpotShadows=T,U.numSpotMaps=D,U.numLightProbes=w,n.version=T0++)}function l(c,u){let h=0,d=0,f=0,g=0,v=0;const m=u.matrixWorldInverse;for(let p=0,E=c.length;p<E;p++){const y=c[p];if(y.isDirectionalLight){const T=n.directional[h];T.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),T.direction.sub(s),T.direction.transformDirection(m),h++}else if(y.isSpotLight){const T=n.spot[f];T.position.setFromMatrixPosition(y.matrixWorld),T.position.applyMatrix4(m),T.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),T.direction.sub(s),T.direction.transformDirection(m),f++}else if(y.isRectAreaLight){const T=n.rectArea[g];T.position.setFromMatrixPosition(y.matrixWorld),T.position.applyMatrix4(m),o.identity(),r.copy(y.matrixWorld),r.premultiply(m),o.extractRotation(r),T.halfWidth.set(y.width*.5,0,0),T.halfHeight.set(0,y.height*.5,0),T.halfWidth.applyMatrix4(o),T.halfHeight.applyMatrix4(o),g++}else if(y.isPointLight){const T=n.point[d];T.position.setFromMatrixPosition(y.matrixWorld),T.position.applyMatrix4(m),d++}else if(y.isHemisphereLight){const T=n.hemi[v];T.direction.setFromMatrixPosition(y.matrixWorld),T.direction.transformDirection(m),v++}}}return{setup:a,setupView:l,state:n}}function Hl(i){const e=new A0(i),t=[],n=[];function s(u){c.camera=u,t.length=0,n.length=0}function r(u){t.push(u)}function o(u){n.push(u)}function a(){e.setup(t)}function l(u){e.setupView(t,u)}const c={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:a,setupLightsView:l,pushLight:r,pushShadow:o}}function C0(i){let e=new WeakMap;function t(s,r=0){const o=e.get(s);let a;return o===void 0?(a=new Hl(i),e.set(s,[a])):r>=o.length?(a=new Hl(i),o.push(a)):a=o[r],a}function n(){e=new WeakMap}return{get:t,dispose:n}}class R0 extends pi{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=wd,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class P0 extends pi{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const L0=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,D0=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function I0(i,e,t){let n=new eo;const s=new ie,r=new ie,o=new rt,a=new R0({depthPacking:Ad}),l=new P0,c={},u=t.maxTextureSize,h={[Gn]:Dt,[Dt]:Gn,[$t]:$t},d=new Ct({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ie},radius:{value:4}},vertexShader:L0,fragmentShader:D0}),f=d.clone();f.defines.HORIZONTAL_PASS=1;const g=new Ke;g.setAttribute("position",new Lt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const v=new be(g,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Ec;let p=this.type;this.render=function(R,w,U){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||R.length===0)return;const b=i.getRenderTarget(),M=i.getActiveCubeFace(),P=i.getActiveMipmapLevel(),k=i.state;k.setBlending(An),k.buffers.color.setClear(1,1,1,1),k.buffers.depth.setTest(!0),k.setScissorTest(!1);const B=p!==bn&&this.type===bn,$=p===bn&&this.type!==bn;for(let Y=0,W=R.length;Y<W;Y++){const j=R[Y],X=j.shadow;if(X===void 0){console.warn("THREE.WebGLShadowMap:",j,"has no shadow.");continue}if(X.autoUpdate===!1&&X.needsUpdate===!1)continue;s.copy(X.mapSize);const ue=X.getFrameExtents();if(s.multiply(ue),r.copy(X.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/ue.x),s.x=r.x*ue.x,X.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/ue.y),s.y=r.y*ue.y,X.mapSize.y=r.y)),X.map===null||B===!0||$===!0){const pe=this.type!==bn?{minFilter:Bt,magFilter:Bt}:{};X.map!==null&&X.map.dispose(),X.map=new an(s.x,s.y,pe),X.map.texture.name=j.name+".shadowMap",X.camera.updateProjectionMatrix()}i.setRenderTarget(X.map),i.clear();const he=X.getViewportCount();for(let pe=0;pe<he;pe++){const He=X.getViewport(pe);o.set(r.x*He.x,r.y*He.y,r.x*He.z,r.y*He.w),k.viewport(o),X.updateMatrices(j,pe),n=X.getFrustum(),T(w,U,X.camera,j,this.type)}X.isPointLightShadow!==!0&&this.type===bn&&E(X,U),X.needsUpdate=!1}p=this.type,m.needsUpdate=!1,i.setRenderTarget(b,M,P)};function E(R,w){const U=e.update(v);d.defines.VSM_SAMPLES!==R.blurSamples&&(d.defines.VSM_SAMPLES=R.blurSamples,f.defines.VSM_SAMPLES=R.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),R.mapPass===null&&(R.mapPass=new an(s.x,s.y)),d.uniforms.shadow_pass.value=R.map.texture,d.uniforms.resolution.value=R.mapSize,d.uniforms.radius.value=R.radius,i.setRenderTarget(R.mapPass),i.clear(),i.renderBufferDirect(w,null,U,d,v,null),f.uniforms.shadow_pass.value=R.mapPass.texture,f.uniforms.resolution.value=R.mapSize,f.uniforms.radius.value=R.radius,i.setRenderTarget(R.map),i.clear(),i.renderBufferDirect(w,null,U,f,v,null)}function y(R,w,U,b){let M=null;const P=U.isPointLight===!0?R.customDistanceMaterial:R.customDepthMaterial;if(P!==void 0)M=P;else if(M=U.isPointLight===!0?l:a,i.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0){const k=M.uuid,B=w.uuid;let $=c[k];$===void 0&&($={},c[k]=$);let Y=$[B];Y===void 0&&(Y=M.clone(),$[B]=Y,w.addEventListener("dispose",D)),M=Y}if(M.visible=w.visible,M.wireframe=w.wireframe,b===bn?M.side=w.shadowSide!==null?w.shadowSide:w.side:M.side=w.shadowSide!==null?w.shadowSide:h[w.side],M.alphaMap=w.alphaMap,M.alphaTest=w.alphaTest,M.map=w.map,M.clipShadows=w.clipShadows,M.clippingPlanes=w.clippingPlanes,M.clipIntersection=w.clipIntersection,M.displacementMap=w.displacementMap,M.displacementScale=w.displacementScale,M.displacementBias=w.displacementBias,M.wireframeLinewidth=w.wireframeLinewidth,M.linewidth=w.linewidth,U.isPointLight===!0&&M.isMeshDistanceMaterial===!0){const k=i.properties.get(M);k.light=U}return M}function T(R,w,U,b,M){if(R.visible===!1)return;if(R.layers.test(w.layers)&&(R.isMesh||R.isLine||R.isPoints)&&(R.castShadow||R.receiveShadow&&M===bn)&&(!R.frustumCulled||n.intersectsObject(R))){R.modelViewMatrix.multiplyMatrices(U.matrixWorldInverse,R.matrixWorld);const B=e.update(R),$=R.material;if(Array.isArray($)){const Y=B.groups;for(let W=0,j=Y.length;W<j;W++){const X=Y[W],ue=$[X.materialIndex];if(ue&&ue.visible){const he=y(R,ue,b,M);R.onBeforeShadow(i,R,w,U,B,he,X),i.renderBufferDirect(U,null,B,he,R,X),R.onAfterShadow(i,R,w,U,B,he,X)}}}else if($.visible){const Y=y(R,$,b,M);R.onBeforeShadow(i,R,w,U,B,Y,null),i.renderBufferDirect(U,null,B,Y,R,null),R.onAfterShadow(i,R,w,U,B,Y,null)}}const k=R.children;for(let B=0,$=k.length;B<$;B++)T(k[B],w,U,b,M)}function D(R){R.target.removeEventListener("dispose",D);for(const U in c){const b=c[U],M=R.target.uuid;M in b&&(b[M].dispose(),delete b[M])}}}function U0(i){function e(){let _=!1;const G=new rt;let O=null;const V=new rt(0,0,0,0);return{setMask:function(Z){O!==Z&&!_&&(i.colorMask(Z,Z,Z,Z),O=Z)},setLocked:function(Z){_=Z},setClear:function(Z,ve,Ce,lt,pt){pt===!0&&(Z*=lt,ve*=lt,Ce*=lt),G.set(Z,ve,Ce,lt),V.equals(G)===!1&&(i.clearColor(Z,ve,Ce,lt),V.copy(G))},reset:function(){_=!1,O=null,V.set(-1,0,0,0)}}}function t(){let _=!1,G=null,O=null,V=null;return{setTest:function(Z){Z?de(i.DEPTH_TEST):oe(i.DEPTH_TEST)},setMask:function(Z){G!==Z&&!_&&(i.depthMask(Z),G=Z)},setFunc:function(Z){if(O!==Z){switch(Z){case ad:i.depthFunc(i.NEVER);break;case od:i.depthFunc(i.ALWAYS);break;case ld:i.depthFunc(i.LESS);break;case ur:i.depthFunc(i.LEQUAL);break;case cd:i.depthFunc(i.EQUAL);break;case ud:i.depthFunc(i.GEQUAL);break;case hd:i.depthFunc(i.GREATER);break;case dd:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}O=Z}},setLocked:function(Z){_=Z},setClear:function(Z){V!==Z&&(i.clearDepth(Z),V=Z)},reset:function(){_=!1,G=null,O=null,V=null}}}function n(){let _=!1,G=null,O=null,V=null,Z=null,ve=null,Ce=null,lt=null,pt=null;return{setTest:function(qe){_||(qe?de(i.STENCIL_TEST):oe(i.STENCIL_TEST))},setMask:function(qe){G!==qe&&!_&&(i.stencilMask(qe),G=qe)},setFunc:function(qe,mt,gt){(O!==qe||V!==mt||Z!==gt)&&(i.stencilFunc(qe,mt,gt),O=qe,V=mt,Z=gt)},setOp:function(qe,mt,gt){(ve!==qe||Ce!==mt||lt!==gt)&&(i.stencilOp(qe,mt,gt),ve=qe,Ce=mt,lt=gt)},setLocked:function(qe){_=qe},setClear:function(qe){pt!==qe&&(i.clearStencil(qe),pt=qe)},reset:function(){_=!1,G=null,O=null,V=null,Z=null,ve=null,Ce=null,lt=null,pt=null}}}const s=new e,r=new t,o=new n,a=new WeakMap,l=new WeakMap;let c={},u={},h=new WeakMap,d=[],f=null,g=!1,v=null,m=null,p=null,E=null,y=null,T=null,D=null,R=new Ee(0,0,0),w=0,U=!1,b=null,M=null,P=null,k=null,B=null;const $=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let Y=!1,W=0;const j=i.getParameter(i.VERSION);j.indexOf("WebGL")!==-1?(W=parseFloat(/^WebGL (\d)/.exec(j)[1]),Y=W>=1):j.indexOf("OpenGL ES")!==-1&&(W=parseFloat(/^OpenGL ES (\d)/.exec(j)[1]),Y=W>=2);let X=null,ue={};const he=i.getParameter(i.SCISSOR_BOX),pe=i.getParameter(i.VIEWPORT),He=new rt().fromArray(he),$e=new rt().fromArray(pe);function q(_,G,O,V){const Z=new Uint8Array(4),ve=i.createTexture();i.bindTexture(_,ve),i.texParameteri(_,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(_,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Ce=0;Ce<O;Ce++)_===i.TEXTURE_3D||_===i.TEXTURE_2D_ARRAY?i.texImage3D(G,0,i.RGBA,1,1,V,0,i.RGBA,i.UNSIGNED_BYTE,Z):i.texImage2D(G+Ce,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,Z);return ve}const ee={};ee[i.TEXTURE_2D]=q(i.TEXTURE_2D,i.TEXTURE_2D,1),ee[i.TEXTURE_CUBE_MAP]=q(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),ee[i.TEXTURE_2D_ARRAY]=q(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),ee[i.TEXTURE_3D]=q(i.TEXTURE_3D,i.TEXTURE_3D,1,1),s.setClear(0,0,0,1),r.setClear(1),o.setClear(0),de(i.DEPTH_TEST),r.setFunc(ur),Me(!1),Xe(bo),de(i.CULL_FACE),ke(An);function de(_){c[_]!==!0&&(i.enable(_),c[_]=!0)}function oe(_){c[_]!==!1&&(i.disable(_),c[_]=!1)}function Oe(_,G){return u[_]!==G?(i.bindFramebuffer(_,G),u[_]=G,_===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=G),_===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=G),!0):!1}function Re(_,G){let O=d,V=!1;if(_){O=h.get(G),O===void 0&&(O=[],h.set(G,O));const Z=_.textures;if(O.length!==Z.length||O[0]!==i.COLOR_ATTACHMENT0){for(let ve=0,Ce=Z.length;ve<Ce;ve++)O[ve]=i.COLOR_ATTACHMENT0+ve;O.length=Z.length,V=!0}}else O[0]!==i.BACK&&(O[0]=i.BACK,V=!0);V&&i.drawBuffers(O)}function Ge(_){return f!==_?(i.useProgram(_),f=_,!0):!1}const L={[ni]:i.FUNC_ADD,[Vh]:i.FUNC_SUBTRACT,[Wh]:i.FUNC_REVERSE_SUBTRACT};L[Xh]=i.MIN,L[$h]=i.MAX;const Ve={[qh]:i.ZERO,[Yh]:i.ONE,[jh]:i.SRC_COLOR,[Da]:i.SRC_ALPHA,[td]:i.SRC_ALPHA_SATURATE,[Qh]:i.DST_COLOR,[Zh]:i.DST_ALPHA,[Kh]:i.ONE_MINUS_SRC_COLOR,[Ia]:i.ONE_MINUS_SRC_ALPHA,[ed]:i.ONE_MINUS_DST_COLOR,[Jh]:i.ONE_MINUS_DST_ALPHA,[nd]:i.CONSTANT_COLOR,[id]:i.ONE_MINUS_CONSTANT_COLOR,[sd]:i.CONSTANT_ALPHA,[rd]:i.ONE_MINUS_CONSTANT_ALPHA};function ke(_,G,O,V,Z,ve,Ce,lt,pt,qe){if(_===An){g===!0&&(oe(i.BLEND),g=!1);return}if(g===!1&&(de(i.BLEND),g=!0),_!==Gh){if(_!==v||qe!==U){if((m!==ni||y!==ni)&&(i.blendEquation(i.FUNC_ADD),m=ni,y=ni),qe)switch(_){case Gi:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Et:i.blendFunc(i.ONE,i.ONE);break;case Eo:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case To:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",_);break}else switch(_){case Gi:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Et:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case Eo:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case To:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",_);break}p=null,E=null,T=null,D=null,R.set(0,0,0),w=0,v=_,U=qe}return}Z=Z||G,ve=ve||O,Ce=Ce||V,(G!==m||Z!==y)&&(i.blendEquationSeparate(L[G],L[Z]),m=G,y=Z),(O!==p||V!==E||ve!==T||Ce!==D)&&(i.blendFuncSeparate(Ve[O],Ve[V],Ve[ve],Ve[Ce]),p=O,E=V,T=ve,D=Ce),(lt.equals(R)===!1||pt!==w)&&(i.blendColor(lt.r,lt.g,lt.b,pt),R.copy(lt),w=pt),v=_,U=!1}function it(_,G){_.side===$t?oe(i.CULL_FACE):de(i.CULL_FACE);let O=_.side===Dt;G&&(O=!O),Me(O),_.blending===Gi&&_.transparent===!1?ke(An):ke(_.blending,_.blendEquation,_.blendSrc,_.blendDst,_.blendEquationAlpha,_.blendSrcAlpha,_.blendDstAlpha,_.blendColor,_.blendAlpha,_.premultipliedAlpha),r.setFunc(_.depthFunc),r.setTest(_.depthTest),r.setMask(_.depthWrite),s.setMask(_.colorWrite);const V=_.stencilWrite;o.setTest(V),V&&(o.setMask(_.stencilWriteMask),o.setFunc(_.stencilFunc,_.stencilRef,_.stencilFuncMask),o.setOp(_.stencilFail,_.stencilZFail,_.stencilZPass)),Pe(_.polygonOffset,_.polygonOffsetFactor,_.polygonOffsetUnits),_.alphaToCoverage===!0?de(i.SAMPLE_ALPHA_TO_COVERAGE):oe(i.SAMPLE_ALPHA_TO_COVERAGE)}function Me(_){b!==_&&(_?i.frontFace(i.CW):i.frontFace(i.CCW),b=_)}function Xe(_){_!==kh?(de(i.CULL_FACE),_!==M&&(_===bo?i.cullFace(i.BACK):_===Hh?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):oe(i.CULL_FACE),M=_}function Fe(_){_!==P&&(Y&&i.lineWidth(_),P=_)}function Pe(_,G,O){_?(de(i.POLYGON_OFFSET_FILL),(k!==G||B!==O)&&(i.polygonOffset(G,O),k=G,B=O)):oe(i.POLYGON_OFFSET_FILL)}function at(_){_?de(i.SCISSOR_TEST):oe(i.SCISSOR_TEST)}function A(_){_===void 0&&(_=i.TEXTURE0+$-1),X!==_&&(i.activeTexture(_),X=_)}function x(_,G,O){O===void 0&&(X===null?O=i.TEXTURE0+$-1:O=X);let V=ue[O];V===void 0&&(V={type:void 0,texture:void 0},ue[O]=V),(V.type!==_||V.texture!==G)&&(X!==O&&(i.activeTexture(O),X=O),i.bindTexture(_,G||ee[_]),V.type=_,V.texture=G)}function H(){const _=ue[X];_!==void 0&&_.type!==void 0&&(i.bindTexture(_.type,null),_.type=void 0,_.texture=void 0)}function K(){try{i.compressedTexImage2D.apply(i,arguments)}catch(_){console.error("THREE.WebGLState:",_)}}function J(){try{i.compressedTexImage3D.apply(i,arguments)}catch(_){console.error("THREE.WebGLState:",_)}}function Q(){try{i.texSubImage2D.apply(i,arguments)}catch(_){console.error("THREE.WebGLState:",_)}}function _e(){try{i.texSubImage3D.apply(i,arguments)}catch(_){console.error("THREE.WebGLState:",_)}}function re(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(_){console.error("THREE.WebGLState:",_)}}function se(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(_){console.error("THREE.WebGLState:",_)}}function Le(){try{i.texStorage2D.apply(i,arguments)}catch(_){console.error("THREE.WebGLState:",_)}}function te(){try{i.texStorage3D.apply(i,arguments)}catch(_){console.error("THREE.WebGLState:",_)}}function me(){try{i.texImage2D.apply(i,arguments)}catch(_){console.error("THREE.WebGLState:",_)}}function ze(){try{i.texImage3D.apply(i,arguments)}catch(_){console.error("THREE.WebGLState:",_)}}function Te(_){He.equals(_)===!1&&(i.scissor(_.x,_.y,_.z,_.w),He.copy(_))}function le(_){$e.equals(_)===!1&&(i.viewport(_.x,_.y,_.z,_.w),$e.copy(_))}function De(_,G){let O=l.get(G);O===void 0&&(O=new WeakMap,l.set(G,O));let V=O.get(_);V===void 0&&(V=i.getUniformBlockIndex(G,_.name),O.set(_,V))}function Ie(_,G){const V=l.get(G).get(_);a.get(G)!==V&&(i.uniformBlockBinding(G,V,_.__bindingPointIndex),a.set(G,V))}function ot(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),c={},X=null,ue={},u={},h=new WeakMap,d=[],f=null,g=!1,v=null,m=null,p=null,E=null,y=null,T=null,D=null,R=new Ee(0,0,0),w=0,U=!1,b=null,M=null,P=null,k=null,B=null,He.set(0,0,i.canvas.width,i.canvas.height),$e.set(0,0,i.canvas.width,i.canvas.height),s.reset(),r.reset(),o.reset()}return{buffers:{color:s,depth:r,stencil:o},enable:de,disable:oe,bindFramebuffer:Oe,drawBuffers:Re,useProgram:Ge,setBlending:ke,setMaterial:it,setFlipSided:Me,setCullFace:Xe,setLineWidth:Fe,setPolygonOffset:Pe,setScissorTest:at,activeTexture:A,bindTexture:x,unbindTexture:H,compressedTexImage2D:K,compressedTexImage3D:J,texImage2D:me,texImage3D:ze,updateUBOMapping:De,uniformBlockBinding:Ie,texStorage2D:Le,texStorage3D:te,texSubImage2D:Q,texSubImage3D:_e,compressedTexSubImage2D:re,compressedTexSubImage3D:se,scissor:Te,viewport:le,reset:ot}}function N0(i,e,t,n,s,r,o){const a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new ie,u=new WeakMap;let h;const d=new WeakMap;let f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(A,x){return f?new OffscreenCanvas(A,x):gr("canvas")}function v(A,x,H){let K=1;const J=at(A);if((J.width>H||J.height>H)&&(K=H/Math.max(J.width,J.height)),K<1)if(typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&A instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&A instanceof ImageBitmap||typeof VideoFrame<"u"&&A instanceof VideoFrame){const Q=Math.floor(K*J.width),_e=Math.floor(K*J.height);h===void 0&&(h=g(Q,_e));const re=x?g(Q,_e):h;return re.width=Q,re.height=_e,re.getContext("2d").drawImage(A,0,0,Q,_e),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+J.width+"x"+J.height+") to ("+Q+"x"+_e+")."),re}else return"data"in A&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+J.width+"x"+J.height+")."),A;return A}function m(A){return A.generateMipmaps&&A.minFilter!==Bt&&A.minFilter!==rn}function p(A){i.generateMipmap(A)}function E(A,x,H,K,J=!1){if(A!==null){if(i[A]!==void 0)return i[A];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+A+"'")}let Q=x;if(x===i.RED&&(H===i.FLOAT&&(Q=i.R32F),H===i.HALF_FLOAT&&(Q=i.R16F),H===i.UNSIGNED_BYTE&&(Q=i.R8)),x===i.RED_INTEGER&&(H===i.UNSIGNED_BYTE&&(Q=i.R8UI),H===i.UNSIGNED_SHORT&&(Q=i.R16UI),H===i.UNSIGNED_INT&&(Q=i.R32UI),H===i.BYTE&&(Q=i.R8I),H===i.SHORT&&(Q=i.R16I),H===i.INT&&(Q=i.R32I)),x===i.RG&&(H===i.FLOAT&&(Q=i.RG32F),H===i.HALF_FLOAT&&(Q=i.RG16F),H===i.UNSIGNED_BYTE&&(Q=i.RG8)),x===i.RG_INTEGER&&(H===i.UNSIGNED_BYTE&&(Q=i.RG8UI),H===i.UNSIGNED_SHORT&&(Q=i.RG16UI),H===i.UNSIGNED_INT&&(Q=i.RG32UI),H===i.BYTE&&(Q=i.RG8I),H===i.SHORT&&(Q=i.RG16I),H===i.INT&&(Q=i.RG32I)),x===i.RGB&&H===i.UNSIGNED_INT_5_9_9_9_REV&&(Q=i.RGB9_E5),x===i.RGBA){const _e=J?dr:Ze.getTransfer(K);H===i.FLOAT&&(Q=i.RGBA32F),H===i.HALF_FLOAT&&(Q=i.RGBA16F),H===i.UNSIGNED_BYTE&&(Q=_e===st?i.SRGB8_ALPHA8:i.RGBA8),H===i.UNSIGNED_SHORT_4_4_4_4&&(Q=i.RGBA4),H===i.UNSIGNED_SHORT_5_5_5_1&&(Q=i.RGB5_A1)}return(Q===i.R16F||Q===i.R32F||Q===i.RG16F||Q===i.RG32F||Q===i.RGBA16F||Q===i.RGBA32F)&&e.get("EXT_color_buffer_float"),Q}function y(A,x){let H;return A?x===null||x===qi||x===Yi?H=i.DEPTH24_STENCIL8:x===Tn?H=i.DEPTH32F_STENCIL8:x===hr&&(H=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):x===null||x===qi||x===Yi?H=i.DEPTH_COMPONENT24:x===Tn?H=i.DEPTH_COMPONENT32F:x===hr&&(H=i.DEPTH_COMPONENT16),H}function T(A,x){return m(A)===!0||A.isFramebufferTexture&&A.minFilter!==Bt&&A.minFilter!==rn?Math.log2(Math.max(x.width,x.height))+1:A.mipmaps!==void 0&&A.mipmaps.length>0?A.mipmaps.length:A.isCompressedTexture&&Array.isArray(A.image)?x.mipmaps.length:1}function D(A){const x=A.target;x.removeEventListener("dispose",D),w(x),x.isVideoTexture&&u.delete(x)}function R(A){const x=A.target;x.removeEventListener("dispose",R),b(x)}function w(A){const x=n.get(A);if(x.__webglInit===void 0)return;const H=A.source,K=d.get(H);if(K){const J=K[x.__cacheKey];J.usedTimes--,J.usedTimes===0&&U(A),Object.keys(K).length===0&&d.delete(H)}n.remove(A)}function U(A){const x=n.get(A);i.deleteTexture(x.__webglTexture);const H=A.source,K=d.get(H);delete K[x.__cacheKey],o.memory.textures--}function b(A){const x=n.get(A);if(A.depthTexture&&A.depthTexture.dispose(),A.isWebGLCubeRenderTarget)for(let K=0;K<6;K++){if(Array.isArray(x.__webglFramebuffer[K]))for(let J=0;J<x.__webglFramebuffer[K].length;J++)i.deleteFramebuffer(x.__webglFramebuffer[K][J]);else i.deleteFramebuffer(x.__webglFramebuffer[K]);x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer[K])}else{if(Array.isArray(x.__webglFramebuffer))for(let K=0;K<x.__webglFramebuffer.length;K++)i.deleteFramebuffer(x.__webglFramebuffer[K]);else i.deleteFramebuffer(x.__webglFramebuffer);if(x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer),x.__webglMultisampledFramebuffer&&i.deleteFramebuffer(x.__webglMultisampledFramebuffer),x.__webglColorRenderbuffer)for(let K=0;K<x.__webglColorRenderbuffer.length;K++)x.__webglColorRenderbuffer[K]&&i.deleteRenderbuffer(x.__webglColorRenderbuffer[K]);x.__webglDepthRenderbuffer&&i.deleteRenderbuffer(x.__webglDepthRenderbuffer)}const H=A.textures;for(let K=0,J=H.length;K<J;K++){const Q=n.get(H[K]);Q.__webglTexture&&(i.deleteTexture(Q.__webglTexture),o.memory.textures--),n.remove(H[K])}n.remove(A)}let M=0;function P(){M=0}function k(){const A=M;return A>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+A+" texture units while this GPU supports only "+s.maxTextures),M+=1,A}function B(A){const x=[];return x.push(A.wrapS),x.push(A.wrapT),x.push(A.wrapR||0),x.push(A.magFilter),x.push(A.minFilter),x.push(A.anisotropy),x.push(A.internalFormat),x.push(A.format),x.push(A.type),x.push(A.generateMipmaps),x.push(A.premultiplyAlpha),x.push(A.flipY),x.push(A.unpackAlignment),x.push(A.colorSpace),x.join()}function $(A,x){const H=n.get(A);if(A.isVideoTexture&&Fe(A),A.isRenderTargetTexture===!1&&A.version>0&&H.__version!==A.version){const K=A.image;if(K===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(K.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{$e(H,A,x);return}}t.bindTexture(i.TEXTURE_2D,H.__webglTexture,i.TEXTURE0+x)}function Y(A,x){const H=n.get(A);if(A.version>0&&H.__version!==A.version){$e(H,A,x);return}t.bindTexture(i.TEXTURE_2D_ARRAY,H.__webglTexture,i.TEXTURE0+x)}function W(A,x){const H=n.get(A);if(A.version>0&&H.__version!==A.version){$e(H,A,x);return}t.bindTexture(i.TEXTURE_3D,H.__webglTexture,i.TEXTURE0+x)}function j(A,x){const H=n.get(A);if(A.version>0&&H.__version!==A.version){q(H,A,x);return}t.bindTexture(i.TEXTURE_CUBE_MAP,H.__webglTexture,i.TEXTURE0+x)}const X={[xs]:i.REPEAT,[si]:i.CLAMP_TO_EDGE,[Oa]:i.MIRRORED_REPEAT},ue={[Bt]:i.NEAREST,[gd]:i.NEAREST_MIPMAP_NEAREST,[Ps]:i.NEAREST_MIPMAP_LINEAR,[rn]:i.LINEAR,[Or]:i.LINEAR_MIPMAP_NEAREST,[ri]:i.LINEAR_MIPMAP_LINEAR},he={[Rd]:i.NEVER,[Nd]:i.ALWAYS,[Pd]:i.LESS,[Hc]:i.LEQUAL,[Ld]:i.EQUAL,[Ud]:i.GEQUAL,[Dd]:i.GREATER,[Id]:i.NOTEQUAL};function pe(A,x){if(x.type===Tn&&e.has("OES_texture_float_linear")===!1&&(x.magFilter===rn||x.magFilter===Or||x.magFilter===Ps||x.magFilter===ri||x.minFilter===rn||x.minFilter===Or||x.minFilter===Ps||x.minFilter===ri)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(A,i.TEXTURE_WRAP_S,X[x.wrapS]),i.texParameteri(A,i.TEXTURE_WRAP_T,X[x.wrapT]),(A===i.TEXTURE_3D||A===i.TEXTURE_2D_ARRAY)&&i.texParameteri(A,i.TEXTURE_WRAP_R,X[x.wrapR]),i.texParameteri(A,i.TEXTURE_MAG_FILTER,ue[x.magFilter]),i.texParameteri(A,i.TEXTURE_MIN_FILTER,ue[x.minFilter]),x.compareFunction&&(i.texParameteri(A,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(A,i.TEXTURE_COMPARE_FUNC,he[x.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(x.magFilter===Bt||x.minFilter!==Ps&&x.minFilter!==ri||x.type===Tn&&e.has("OES_texture_float_linear")===!1)return;if(x.anisotropy>1||n.get(x).__currentAnisotropy){const H=e.get("EXT_texture_filter_anisotropic");i.texParameterf(A,H.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(x.anisotropy,s.getMaxAnisotropy())),n.get(x).__currentAnisotropy=x.anisotropy}}}function He(A,x){let H=!1;A.__webglInit===void 0&&(A.__webglInit=!0,x.addEventListener("dispose",D));const K=x.source;let J=d.get(K);J===void 0&&(J={},d.set(K,J));const Q=B(x);if(Q!==A.__cacheKey){J[Q]===void 0&&(J[Q]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,H=!0),J[Q].usedTimes++;const _e=J[A.__cacheKey];_e!==void 0&&(J[A.__cacheKey].usedTimes--,_e.usedTimes===0&&U(x)),A.__cacheKey=Q,A.__webglTexture=J[Q].texture}return H}function $e(A,x,H){let K=i.TEXTURE_2D;(x.isDataArrayTexture||x.isCompressedArrayTexture)&&(K=i.TEXTURE_2D_ARRAY),x.isData3DTexture&&(K=i.TEXTURE_3D);const J=He(A,x),Q=x.source;t.bindTexture(K,A.__webglTexture,i.TEXTURE0+H);const _e=n.get(Q);if(Q.version!==_e.__version||J===!0){t.activeTexture(i.TEXTURE0+H);const re=Ze.getPrimaries(Ze.workingColorSpace),se=x.colorSpace===Bn?null:Ze.getPrimaries(x.colorSpace),Le=x.colorSpace===Bn||re===se?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Le);let te=v(x.image,!1,s.maxTextureSize);te=Pe(x,te);const me=r.convert(x.format,x.colorSpace),ze=r.convert(x.type);let Te=E(x.internalFormat,me,ze,x.colorSpace,x.isVideoTexture);pe(K,x);let le;const De=x.mipmaps,Ie=x.isVideoTexture!==!0,ot=_e.__version===void 0||J===!0,_=Q.dataReady,G=T(x,te);if(x.isDepthTexture)Te=y(x.format===ji,x.type),ot&&(Ie?t.texStorage2D(i.TEXTURE_2D,1,Te,te.width,te.height):t.texImage2D(i.TEXTURE_2D,0,Te,te.width,te.height,0,me,ze,null));else if(x.isDataTexture)if(De.length>0){Ie&&ot&&t.texStorage2D(i.TEXTURE_2D,G,Te,De[0].width,De[0].height);for(let O=0,V=De.length;O<V;O++)le=De[O],Ie?_&&t.texSubImage2D(i.TEXTURE_2D,O,0,0,le.width,le.height,me,ze,le.data):t.texImage2D(i.TEXTURE_2D,O,Te,le.width,le.height,0,me,ze,le.data);x.generateMipmaps=!1}else Ie?(ot&&t.texStorage2D(i.TEXTURE_2D,G,Te,te.width,te.height),_&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,te.width,te.height,me,ze,te.data)):t.texImage2D(i.TEXTURE_2D,0,Te,te.width,te.height,0,me,ze,te.data);else if(x.isCompressedTexture)if(x.isCompressedArrayTexture){Ie&&ot&&t.texStorage3D(i.TEXTURE_2D_ARRAY,G,Te,De[0].width,De[0].height,te.depth);for(let O=0,V=De.length;O<V;O++)if(le=De[O],x.format!==pn)if(me!==null)if(Ie){if(_)if(x.layerUpdates.size>0){for(const Z of x.layerUpdates){const ve=le.width*le.height;t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,O,0,0,Z,le.width,le.height,1,me,le.data.slice(ve*Z,ve*(Z+1)),0,0)}x.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,O,0,0,0,le.width,le.height,te.depth,me,le.data,0,0)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,O,Te,le.width,le.height,te.depth,0,le.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ie?_&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,O,0,0,0,le.width,le.height,te.depth,me,ze,le.data):t.texImage3D(i.TEXTURE_2D_ARRAY,O,Te,le.width,le.height,te.depth,0,me,ze,le.data)}else{Ie&&ot&&t.texStorage2D(i.TEXTURE_2D,G,Te,De[0].width,De[0].height);for(let O=0,V=De.length;O<V;O++)le=De[O],x.format!==pn?me!==null?Ie?_&&t.compressedTexSubImage2D(i.TEXTURE_2D,O,0,0,le.width,le.height,me,le.data):t.compressedTexImage2D(i.TEXTURE_2D,O,Te,le.width,le.height,0,le.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ie?_&&t.texSubImage2D(i.TEXTURE_2D,O,0,0,le.width,le.height,me,ze,le.data):t.texImage2D(i.TEXTURE_2D,O,Te,le.width,le.height,0,me,ze,le.data)}else if(x.isDataArrayTexture)if(Ie){if(ot&&t.texStorage3D(i.TEXTURE_2D_ARRAY,G,Te,te.width,te.height,te.depth),_)if(x.layerUpdates.size>0){let O;switch(ze){case i.UNSIGNED_BYTE:switch(me){case i.ALPHA:O=1;break;case i.LUMINANCE:O=1;break;case i.LUMINANCE_ALPHA:O=2;break;case i.RGB:O=3;break;case i.RGBA:O=4;break;default:throw new Error(`Unknown texel size for format ${me}.`)}break;case i.UNSIGNED_SHORT_4_4_4_4:case i.UNSIGNED_SHORT_5_5_5_1:case i.UNSIGNED_SHORT_5_6_5:O=1;break;default:throw new Error(`Unknown texel size for type ${ze}.`)}const V=te.width*te.height*O;for(const Z of x.layerUpdates)t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Z,te.width,te.height,1,me,ze,te.data.slice(V*Z,V*(Z+1)));x.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,te.width,te.height,te.depth,me,ze,te.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,Te,te.width,te.height,te.depth,0,me,ze,te.data);else if(x.isData3DTexture)Ie?(ot&&t.texStorage3D(i.TEXTURE_3D,G,Te,te.width,te.height,te.depth),_&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,te.width,te.height,te.depth,me,ze,te.data)):t.texImage3D(i.TEXTURE_3D,0,Te,te.width,te.height,te.depth,0,me,ze,te.data);else if(x.isFramebufferTexture){if(ot)if(Ie)t.texStorage2D(i.TEXTURE_2D,G,Te,te.width,te.height);else{let O=te.width,V=te.height;for(let Z=0;Z<G;Z++)t.texImage2D(i.TEXTURE_2D,Z,Te,O,V,0,me,ze,null),O>>=1,V>>=1}}else if(De.length>0){if(Ie&&ot){const O=at(De[0]);t.texStorage2D(i.TEXTURE_2D,G,Te,O.width,O.height)}for(let O=0,V=De.length;O<V;O++)le=De[O],Ie?_&&t.texSubImage2D(i.TEXTURE_2D,O,0,0,me,ze,le):t.texImage2D(i.TEXTURE_2D,O,Te,me,ze,le);x.generateMipmaps=!1}else if(Ie){if(ot){const O=at(te);t.texStorage2D(i.TEXTURE_2D,G,Te,O.width,O.height)}_&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,me,ze,te)}else t.texImage2D(i.TEXTURE_2D,0,Te,me,ze,te);m(x)&&p(K),_e.__version=Q.version,x.onUpdate&&x.onUpdate(x)}A.__version=x.version}function q(A,x,H){if(x.image.length!==6)return;const K=He(A,x),J=x.source;t.bindTexture(i.TEXTURE_CUBE_MAP,A.__webglTexture,i.TEXTURE0+H);const Q=n.get(J);if(J.version!==Q.__version||K===!0){t.activeTexture(i.TEXTURE0+H);const _e=Ze.getPrimaries(Ze.workingColorSpace),re=x.colorSpace===Bn?null:Ze.getPrimaries(x.colorSpace),se=x.colorSpace===Bn||_e===re?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,se);const Le=x.isCompressedTexture||x.image[0].isCompressedTexture,te=x.image[0]&&x.image[0].isDataTexture,me=[];for(let V=0;V<6;V++)!Le&&!te?me[V]=v(x.image[V],!0,s.maxCubemapSize):me[V]=te?x.image[V].image:x.image[V],me[V]=Pe(x,me[V]);const ze=me[0],Te=r.convert(x.format,x.colorSpace),le=r.convert(x.type),De=E(x.internalFormat,Te,le,x.colorSpace),Ie=x.isVideoTexture!==!0,ot=Q.__version===void 0||K===!0,_=J.dataReady;let G=T(x,ze);pe(i.TEXTURE_CUBE_MAP,x);let O;if(Le){Ie&&ot&&t.texStorage2D(i.TEXTURE_CUBE_MAP,G,De,ze.width,ze.height);for(let V=0;V<6;V++){O=me[V].mipmaps;for(let Z=0;Z<O.length;Z++){const ve=O[Z];x.format!==pn?Te!==null?Ie?_&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+V,Z,0,0,ve.width,ve.height,Te,ve.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+V,Z,De,ve.width,ve.height,0,ve.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ie?_&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+V,Z,0,0,ve.width,ve.height,Te,le,ve.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+V,Z,De,ve.width,ve.height,0,Te,le,ve.data)}}}else{if(O=x.mipmaps,Ie&&ot){O.length>0&&G++;const V=at(me[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,G,De,V.width,V.height)}for(let V=0;V<6;V++)if(te){Ie?_&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+V,0,0,0,me[V].width,me[V].height,Te,le,me[V].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+V,0,De,me[V].width,me[V].height,0,Te,le,me[V].data);for(let Z=0;Z<O.length;Z++){const Ce=O[Z].image[V].image;Ie?_&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+V,Z+1,0,0,Ce.width,Ce.height,Te,le,Ce.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+V,Z+1,De,Ce.width,Ce.height,0,Te,le,Ce.data)}}else{Ie?_&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+V,0,0,0,Te,le,me[V]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+V,0,De,Te,le,me[V]);for(let Z=0;Z<O.length;Z++){const ve=O[Z];Ie?_&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+V,Z+1,0,0,Te,le,ve.image[V]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+V,Z+1,De,Te,le,ve.image[V])}}}m(x)&&p(i.TEXTURE_CUBE_MAP),Q.__version=J.version,x.onUpdate&&x.onUpdate(x)}A.__version=x.version}function ee(A,x,H,K,J,Q){const _e=r.convert(H.format,H.colorSpace),re=r.convert(H.type),se=E(H.internalFormat,_e,re,H.colorSpace);if(!n.get(x).__hasExternalTextures){const te=Math.max(1,x.width>>Q),me=Math.max(1,x.height>>Q);J===i.TEXTURE_3D||J===i.TEXTURE_2D_ARRAY?t.texImage3D(J,Q,se,te,me,x.depth,0,_e,re,null):t.texImage2D(J,Q,se,te,me,0,_e,re,null)}t.bindFramebuffer(i.FRAMEBUFFER,A),Xe(x)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,K,J,n.get(H).__webglTexture,0,Me(x)):(J===i.TEXTURE_2D||J>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&J<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,K,J,n.get(H).__webglTexture,Q),t.bindFramebuffer(i.FRAMEBUFFER,null)}function de(A,x,H){if(i.bindRenderbuffer(i.RENDERBUFFER,A),x.depthBuffer){const K=x.depthTexture,J=K&&K.isDepthTexture?K.type:null,Q=y(x.stencilBuffer,J),_e=x.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,re=Me(x);Xe(x)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,re,Q,x.width,x.height):H?i.renderbufferStorageMultisample(i.RENDERBUFFER,re,Q,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,Q,x.width,x.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,_e,i.RENDERBUFFER,A)}else{const K=x.textures;for(let J=0;J<K.length;J++){const Q=K[J],_e=r.convert(Q.format,Q.colorSpace),re=r.convert(Q.type),se=E(Q.internalFormat,_e,re,Q.colorSpace),Le=Me(x);H&&Xe(x)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,Le,se,x.width,x.height):Xe(x)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Le,se,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,se,x.width,x.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function oe(A,x){if(x&&x.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,A),!(x.depthTexture&&x.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!n.get(x.depthTexture).__webglTexture||x.depthTexture.image.width!==x.width||x.depthTexture.image.height!==x.height)&&(x.depthTexture.image.width=x.width,x.depthTexture.image.height=x.height,x.depthTexture.needsUpdate=!0),$(x.depthTexture,0);const K=n.get(x.depthTexture).__webglTexture,J=Me(x);if(x.depthTexture.format===Vi)Xe(x)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,K,0,J):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,K,0);else if(x.depthTexture.format===ji)Xe(x)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,K,0,J):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,K,0);else throw new Error("Unknown depthTexture format")}function Oe(A){const x=n.get(A),H=A.isWebGLCubeRenderTarget===!0;if(A.depthTexture&&!x.__autoAllocateDepthBuffer){if(H)throw new Error("target.depthTexture not supported in Cube render targets");oe(x.__webglFramebuffer,A)}else if(H){x.__webglDepthbuffer=[];for(let K=0;K<6;K++)t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer[K]),x.__webglDepthbuffer[K]=i.createRenderbuffer(),de(x.__webglDepthbuffer[K],A,!1)}else t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer),x.__webglDepthbuffer=i.createRenderbuffer(),de(x.__webglDepthbuffer,A,!1);t.bindFramebuffer(i.FRAMEBUFFER,null)}function Re(A,x,H){const K=n.get(A);x!==void 0&&ee(K.__webglFramebuffer,A,A.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),H!==void 0&&Oe(A)}function Ge(A){const x=A.texture,H=n.get(A),K=n.get(x);A.addEventListener("dispose",R);const J=A.textures,Q=A.isWebGLCubeRenderTarget===!0,_e=J.length>1;if(_e||(K.__webglTexture===void 0&&(K.__webglTexture=i.createTexture()),K.__version=x.version,o.memory.textures++),Q){H.__webglFramebuffer=[];for(let re=0;re<6;re++)if(x.mipmaps&&x.mipmaps.length>0){H.__webglFramebuffer[re]=[];for(let se=0;se<x.mipmaps.length;se++)H.__webglFramebuffer[re][se]=i.createFramebuffer()}else H.__webglFramebuffer[re]=i.createFramebuffer()}else{if(x.mipmaps&&x.mipmaps.length>0){H.__webglFramebuffer=[];for(let re=0;re<x.mipmaps.length;re++)H.__webglFramebuffer[re]=i.createFramebuffer()}else H.__webglFramebuffer=i.createFramebuffer();if(_e)for(let re=0,se=J.length;re<se;re++){const Le=n.get(J[re]);Le.__webglTexture===void 0&&(Le.__webglTexture=i.createTexture(),o.memory.textures++)}if(A.samples>0&&Xe(A)===!1){H.__webglMultisampledFramebuffer=i.createFramebuffer(),H.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,H.__webglMultisampledFramebuffer);for(let re=0;re<J.length;re++){const se=J[re];H.__webglColorRenderbuffer[re]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,H.__webglColorRenderbuffer[re]);const Le=r.convert(se.format,se.colorSpace),te=r.convert(se.type),me=E(se.internalFormat,Le,te,se.colorSpace,A.isXRRenderTarget===!0),ze=Me(A);i.renderbufferStorageMultisample(i.RENDERBUFFER,ze,me,A.width,A.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+re,i.RENDERBUFFER,H.__webglColorRenderbuffer[re])}i.bindRenderbuffer(i.RENDERBUFFER,null),A.depthBuffer&&(H.__webglDepthRenderbuffer=i.createRenderbuffer(),de(H.__webglDepthRenderbuffer,A,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(Q){t.bindTexture(i.TEXTURE_CUBE_MAP,K.__webglTexture),pe(i.TEXTURE_CUBE_MAP,x);for(let re=0;re<6;re++)if(x.mipmaps&&x.mipmaps.length>0)for(let se=0;se<x.mipmaps.length;se++)ee(H.__webglFramebuffer[re][se],A,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+re,se);else ee(H.__webglFramebuffer[re],A,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+re,0);m(x)&&p(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(_e){for(let re=0,se=J.length;re<se;re++){const Le=J[re],te=n.get(Le);t.bindTexture(i.TEXTURE_2D,te.__webglTexture),pe(i.TEXTURE_2D,Le),ee(H.__webglFramebuffer,A,Le,i.COLOR_ATTACHMENT0+re,i.TEXTURE_2D,0),m(Le)&&p(i.TEXTURE_2D)}t.unbindTexture()}else{let re=i.TEXTURE_2D;if((A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(re=A.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(re,K.__webglTexture),pe(re,x),x.mipmaps&&x.mipmaps.length>0)for(let se=0;se<x.mipmaps.length;se++)ee(H.__webglFramebuffer[se],A,x,i.COLOR_ATTACHMENT0,re,se);else ee(H.__webglFramebuffer,A,x,i.COLOR_ATTACHMENT0,re,0);m(x)&&p(re),t.unbindTexture()}A.depthBuffer&&Oe(A)}function L(A){const x=A.textures;for(let H=0,K=x.length;H<K;H++){const J=x[H];if(m(J)){const Q=A.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:i.TEXTURE_2D,_e=n.get(J).__webglTexture;t.bindTexture(Q,_e),p(Q),t.unbindTexture()}}}const Ve=[],ke=[];function it(A){if(A.samples>0){if(Xe(A)===!1){const x=A.textures,H=A.width,K=A.height;let J=i.COLOR_BUFFER_BIT;const Q=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,_e=n.get(A),re=x.length>1;if(re)for(let se=0;se<x.length;se++)t.bindFramebuffer(i.FRAMEBUFFER,_e.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+se,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,_e.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+se,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,_e.__webglMultisampledFramebuffer),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,_e.__webglFramebuffer);for(let se=0;se<x.length;se++){if(A.resolveDepthBuffer&&(A.depthBuffer&&(J|=i.DEPTH_BUFFER_BIT),A.stencilBuffer&&A.resolveStencilBuffer&&(J|=i.STENCIL_BUFFER_BIT)),re){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,_e.__webglColorRenderbuffer[se]);const Le=n.get(x[se]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Le,0)}i.blitFramebuffer(0,0,H,K,0,0,H,K,J,i.NEAREST),l===!0&&(Ve.length=0,ke.length=0,Ve.push(i.COLOR_ATTACHMENT0+se),A.depthBuffer&&A.resolveDepthBuffer===!1&&(Ve.push(Q),ke.push(Q),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,ke)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Ve))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),re)for(let se=0;se<x.length;se++){t.bindFramebuffer(i.FRAMEBUFFER,_e.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+se,i.RENDERBUFFER,_e.__webglColorRenderbuffer[se]);const Le=n.get(x[se]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,_e.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+se,i.TEXTURE_2D,Le,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,_e.__webglMultisampledFramebuffer)}else if(A.depthBuffer&&A.resolveDepthBuffer===!1&&l){const x=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[x])}}}function Me(A){return Math.min(s.maxSamples,A.samples)}function Xe(A){const x=n.get(A);return A.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&x.__useRenderToTexture!==!1}function Fe(A){const x=o.render.frame;u.get(A)!==x&&(u.set(A,x),A.update())}function Pe(A,x){const H=A.colorSpace,K=A.format,J=A.type;return A.isCompressedTexture===!0||A.isVideoTexture===!0||H!==Wn&&H!==Bn&&(Ze.getTransfer(H)===st?(K!==pn||J!==Vn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",H)),x}function at(A){return typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement?(c.width=A.naturalWidth||A.width,c.height=A.naturalHeight||A.height):typeof VideoFrame<"u"&&A instanceof VideoFrame?(c.width=A.displayWidth,c.height=A.displayHeight):(c.width=A.width,c.height=A.height),c}this.allocateTextureUnit=k,this.resetTextureUnits=P,this.setTexture2D=$,this.setTexture2DArray=Y,this.setTexture3D=W,this.setTextureCube=j,this.rebindTextures=Re,this.setupRenderTarget=Ge,this.updateRenderTargetMipmap=L,this.updateMultisampleRenderTarget=it,this.setupDepthRenderbuffer=Oe,this.setupFrameBufferTexture=ee,this.useMultisampledRTT=Xe}function O0(i,e){function t(n,s=Bn){let r;const o=Ze.getTransfer(s);if(n===Vn)return i.UNSIGNED_BYTE;if(n===Uc)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Nc)return i.UNSIGNED_SHORT_5_5_5_1;if(n===xd)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===_d)return i.BYTE;if(n===vd)return i.SHORT;if(n===hr)return i.UNSIGNED_SHORT;if(n===Ic)return i.INT;if(n===qi)return i.UNSIGNED_INT;if(n===Tn)return i.FLOAT;if(n===Hn)return i.HALF_FLOAT;if(n===yd)return i.ALPHA;if(n===Md)return i.RGB;if(n===pn)return i.RGBA;if(n===Sd)return i.LUMINANCE;if(n===bd)return i.LUMINANCE_ALPHA;if(n===Vi)return i.DEPTH_COMPONENT;if(n===ji)return i.DEPTH_STENCIL;if(n===Oc)return i.RED;if(n===Fc)return i.RED_INTEGER;if(n===Ed)return i.RG;if(n===Bc)return i.RG_INTEGER;if(n===zc)return i.RGBA_INTEGER;if(n===Fr||n===Br||n===zr||n===kr)if(o===st)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Fr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Br)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===zr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===kr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Fr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Br)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===zr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===kr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===wo||n===Ao||n===Co||n===Ro)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===wo)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Ao)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Co)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Ro)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Po||n===Lo||n===Do)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Po||n===Lo)return o===st?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Do)return o===st?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===Io||n===Uo||n===No||n===Oo||n===Fo||n===Bo||n===zo||n===ko||n===Ho||n===Go||n===Vo||n===Wo||n===Xo||n===$o)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Io)return o===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Uo)return o===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===No)return o===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Oo)return o===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Fo)return o===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Bo)return o===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===zo)return o===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===ko)return o===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Ho)return o===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Go)return o===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Vo)return o===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Wo)return o===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Xo)return o===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===$o)return o===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Hr||n===qo||n===Yo)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===Hr)return o===st?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===qo)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Yo)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Td||n===jo||n===Ko||n===Zo)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===Hr)return r.COMPRESSED_RED_RGTC1_EXT;if(n===jo)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Ko)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Zo)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Yi?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}class F0 extends Jt{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class ft extends dt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const B0={type:"move"};class fa{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new ft,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new ft,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new C,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new C),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new ft,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new C,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new C),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(const v of e.hand.values()){const m=t.getJointPose(v,n),p=this._getHandJoint(c,v);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}const u=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],d=u.position.distanceTo(h.position),f=.02,g=.005;c.inputState.pinching&&d>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(B0)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new ft;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}const z0=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,k0=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class H0{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,n){if(this.texture===null){const s=new It,r=e.properties.get(s);r.__webglTexture=t.texture,(t.depthNear!=n.depthNear||t.depthFar!=n.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=s}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new Ct({vertexShader:z0,fragmentShader:k0,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new be(new li(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}}class G0 extends hi{constructor(e,t){super();const n=this;let s=null,r=1,o=null,a="local-floor",l=1,c=null,u=null,h=null,d=null,f=null,g=null;const v=new H0,m=t.getContextAttributes();let p=null,E=null;const y=[],T=[],D=new ie;let R=null;const w=new Jt;w.layers.enable(1),w.viewport=new rt;const U=new Jt;U.layers.enable(2),U.viewport=new rt;const b=[w,U],M=new F0;M.layers.enable(1),M.layers.enable(2);let P=null,k=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(q){let ee=y[q];return ee===void 0&&(ee=new fa,y[q]=ee),ee.getTargetRaySpace()},this.getControllerGrip=function(q){let ee=y[q];return ee===void 0&&(ee=new fa,y[q]=ee),ee.getGripSpace()},this.getHand=function(q){let ee=y[q];return ee===void 0&&(ee=new fa,y[q]=ee),ee.getHandSpace()};function B(q){const ee=T.indexOf(q.inputSource);if(ee===-1)return;const de=y[ee];de!==void 0&&(de.update(q.inputSource,q.frame,c||o),de.dispatchEvent({type:q.type,data:q.inputSource}))}function $(){s.removeEventListener("select",B),s.removeEventListener("selectstart",B),s.removeEventListener("selectend",B),s.removeEventListener("squeeze",B),s.removeEventListener("squeezestart",B),s.removeEventListener("squeezeend",B),s.removeEventListener("end",$),s.removeEventListener("inputsourceschange",Y);for(let q=0;q<y.length;q++){const ee=T[q];ee!==null&&(T[q]=null,y[q].disconnect(ee))}P=null,k=null,v.reset(),e.setRenderTarget(p),f=null,d=null,h=null,s=null,E=null,$e.stop(),n.isPresenting=!1,e.setPixelRatio(R),e.setSize(D.width,D.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(q){r=q,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(q){a=q,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(q){c=q},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return h},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(q){if(s=q,s!==null){if(p=e.getRenderTarget(),s.addEventListener("select",B),s.addEventListener("selectstart",B),s.addEventListener("selectend",B),s.addEventListener("squeeze",B),s.addEventListener("squeezestart",B),s.addEventListener("squeezeend",B),s.addEventListener("end",$),s.addEventListener("inputsourceschange",Y),m.xrCompatible!==!0&&await t.makeXRCompatible(),R=e.getPixelRatio(),e.getSize(D),s.renderState.layers===void 0){const ee={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,t,ee),s.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),E=new an(f.framebufferWidth,f.framebufferHeight,{format:pn,type:Vn,colorSpace:e.outputColorSpace,stencilBuffer:m.stencil})}else{let ee=null,de=null,oe=null;m.depth&&(oe=m.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ee=m.stencil?ji:Vi,de=m.stencil?Yi:qi);const Oe={colorFormat:t.RGBA8,depthFormat:oe,scaleFactor:r};h=new XRWebGLBinding(s,t),d=h.createProjectionLayer(Oe),s.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),E=new an(d.textureWidth,d.textureHeight,{format:pn,type:Vn,depthTexture:new Qc(d.textureWidth,d.textureHeight,de,void 0,void 0,void 0,void 0,void 0,void 0,ee),stencilBuffer:m.stencil,colorSpace:e.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1})}E.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),$e.setContext(s),$e.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode};function Y(q){for(let ee=0;ee<q.removed.length;ee++){const de=q.removed[ee],oe=T.indexOf(de);oe>=0&&(T[oe]=null,y[oe].disconnect(de))}for(let ee=0;ee<q.added.length;ee++){const de=q.added[ee];let oe=T.indexOf(de);if(oe===-1){for(let Re=0;Re<y.length;Re++)if(Re>=T.length){T.push(de),oe=Re;break}else if(T[Re]===null){T[Re]=de,oe=Re;break}if(oe===-1)break}const Oe=y[oe];Oe&&Oe.connect(de)}}const W=new C,j=new C;function X(q,ee,de){W.setFromMatrixPosition(ee.matrixWorld),j.setFromMatrixPosition(de.matrixWorld);const oe=W.distanceTo(j),Oe=ee.projectionMatrix.elements,Re=de.projectionMatrix.elements,Ge=Oe[14]/(Oe[10]-1),L=Oe[14]/(Oe[10]+1),Ve=(Oe[9]+1)/Oe[5],ke=(Oe[9]-1)/Oe[5],it=(Oe[8]-1)/Oe[0],Me=(Re[8]+1)/Re[0],Xe=Ge*it,Fe=Ge*Me,Pe=oe/(-it+Me),at=Pe*-it;ee.matrixWorld.decompose(q.position,q.quaternion,q.scale),q.translateX(at),q.translateZ(Pe),q.matrixWorld.compose(q.position,q.quaternion,q.scale),q.matrixWorldInverse.copy(q.matrixWorld).invert();const A=Ge+Pe,x=L+Pe,H=Xe-at,K=Fe+(oe-at),J=Ve*L/x*A,Q=ke*L/x*A;q.projectionMatrix.makePerspective(H,K,J,Q,A,x),q.projectionMatrixInverse.copy(q.projectionMatrix).invert()}function ue(q,ee){ee===null?q.matrixWorld.copy(q.matrix):q.matrixWorld.multiplyMatrices(ee.matrixWorld,q.matrix),q.matrixWorldInverse.copy(q.matrixWorld).invert()}this.updateCamera=function(q){if(s===null)return;v.texture!==null&&(q.near=v.depthNear,q.far=v.depthFar),M.near=U.near=w.near=q.near,M.far=U.far=w.far=q.far,(P!==M.near||k!==M.far)&&(s.updateRenderState({depthNear:M.near,depthFar:M.far}),P=M.near,k=M.far,w.near=P,w.far=k,U.near=P,U.far=k,w.updateProjectionMatrix(),U.updateProjectionMatrix(),q.updateProjectionMatrix());const ee=q.parent,de=M.cameras;ue(M,ee);for(let oe=0;oe<de.length;oe++)ue(de[oe],ee);de.length===2?X(M,w,U):M.projectionMatrix.copy(w.projectionMatrix),he(q,M,ee)};function he(q,ee,de){de===null?q.matrix.copy(ee.matrixWorld):(q.matrix.copy(de.matrixWorld),q.matrix.invert(),q.matrix.multiply(ee.matrixWorld)),q.matrix.decompose(q.position,q.quaternion,q.scale),q.updateMatrixWorld(!0),q.projectionMatrix.copy(ee.projectionMatrix),q.projectionMatrixInverse.copy(ee.projectionMatrixInverse),q.isPerspectiveCamera&&(q.fov=Fa*2*Math.atan(1/q.projectionMatrix.elements[5]),q.zoom=1)}this.getCamera=function(){return M},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function(q){l=q,d!==null&&(d.fixedFoveation=q),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=q)},this.hasDepthSensing=function(){return v.texture!==null},this.getDepthSensingMesh=function(){return v.getMesh(M)};let pe=null;function He(q,ee){if(u=ee.getViewerPose(c||o),g=ee,u!==null){const de=u.views;f!==null&&(e.setRenderTargetFramebuffer(E,f.framebuffer),e.setRenderTarget(E));let oe=!1;de.length!==M.cameras.length&&(M.cameras.length=0,oe=!0);for(let Re=0;Re<de.length;Re++){const Ge=de[Re];let L=null;if(f!==null)L=f.getViewport(Ge);else{const ke=h.getViewSubImage(d,Ge);L=ke.viewport,Re===0&&(e.setRenderTargetTextures(E,ke.colorTexture,d.ignoreDepthValues?void 0:ke.depthStencilTexture),e.setRenderTarget(E))}let Ve=b[Re];Ve===void 0&&(Ve=new Jt,Ve.layers.enable(Re),Ve.viewport=new rt,b[Re]=Ve),Ve.matrix.fromArray(Ge.transform.matrix),Ve.matrix.decompose(Ve.position,Ve.quaternion,Ve.scale),Ve.projectionMatrix.fromArray(Ge.projectionMatrix),Ve.projectionMatrixInverse.copy(Ve.projectionMatrix).invert(),Ve.viewport.set(L.x,L.y,L.width,L.height),Re===0&&(M.matrix.copy(Ve.matrix),M.matrix.decompose(M.position,M.quaternion,M.scale)),oe===!0&&M.cameras.push(Ve)}const Oe=s.enabledFeatures;if(Oe&&Oe.includes("depth-sensing")){const Re=h.getDepthInformation(de[0]);Re&&Re.isValid&&Re.texture&&v.init(e,Re,s.renderState)}}for(let de=0;de<y.length;de++){const oe=T[de],Oe=y[de];oe!==null&&Oe!==void 0&&Oe.update(oe,ee,c||o)}pe&&pe(q,ee),ee.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ee}),g=null}const $e=new Jc;$e.setAnimationLoop(He),this.setAnimationLoop=function(q){pe=q},this.dispose=function(){}}}const ei=new mn,V0=new et;function W0(i,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,jc(i)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function s(m,p,E,y,T){p.isMeshBasicMaterial||p.isMeshLambertMaterial?r(m,p):p.isMeshToonMaterial?(r(m,p),h(m,p)):p.isMeshPhongMaterial?(r(m,p),u(m,p)):p.isMeshStandardMaterial?(r(m,p),d(m,p),p.isMeshPhysicalMaterial&&f(m,p,T)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),v(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(o(m,p),p.isLineDashedMaterial&&a(m,p)):p.isPointsMaterial?l(m,p,E,y):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===Dt&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===Dt&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);const E=e.get(p),y=E.envMap,T=E.envMapRotation;y&&(m.envMap.value=y,ei.copy(T),ei.x*=-1,ei.y*=-1,ei.z*=-1,y.isCubeTexture&&y.isRenderTargetTexture===!1&&(ei.y*=-1,ei.z*=-1),m.envMapRotation.value.setFromMatrix4(V0.makeRotationFromEuler(ei)),m.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function o(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function a(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,E,y){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*E,m.scale.value=y*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function u(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function h(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function d(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,E){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Dt&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=E.texture,m.transmissionSamplerSize.value.set(E.width,E.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function v(m,p){const E=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(E.matrixWorld),m.nearDistance.value=E.shadow.camera.near,m.farDistance.value=E.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function X0(i,e,t,n){let s={},r={},o=[];const a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(E,y){const T=y.program;n.uniformBlockBinding(E,T)}function c(E,y){let T=s[E.id];T===void 0&&(g(E),T=u(E),s[E.id]=T,E.addEventListener("dispose",m));const D=y.program;n.updateUBOMapping(E,D);const R=e.render.frame;r[E.id]!==R&&(d(E),r[E.id]=R)}function u(E){const y=h();E.__bindingPointIndex=y;const T=i.createBuffer(),D=E.__size,R=E.usage;return i.bindBuffer(i.UNIFORM_BUFFER,T),i.bufferData(i.UNIFORM_BUFFER,D,R),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,y,T),T}function h(){for(let E=0;E<a;E++)if(o.indexOf(E)===-1)return o.push(E),E;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(E){const y=s[E.id],T=E.uniforms,D=E.__cache;i.bindBuffer(i.UNIFORM_BUFFER,y);for(let R=0,w=T.length;R<w;R++){const U=Array.isArray(T[R])?T[R]:[T[R]];for(let b=0,M=U.length;b<M;b++){const P=U[b];if(f(P,R,b,D)===!0){const k=P.__offset,B=Array.isArray(P.value)?P.value:[P.value];let $=0;for(let Y=0;Y<B.length;Y++){const W=B[Y],j=v(W);typeof W=="number"||typeof W=="boolean"?(P.__data[0]=W,i.bufferSubData(i.UNIFORM_BUFFER,k+$,P.__data)):W.isMatrix3?(P.__data[0]=W.elements[0],P.__data[1]=W.elements[1],P.__data[2]=W.elements[2],P.__data[3]=0,P.__data[4]=W.elements[3],P.__data[5]=W.elements[4],P.__data[6]=W.elements[5],P.__data[7]=0,P.__data[8]=W.elements[6],P.__data[9]=W.elements[7],P.__data[10]=W.elements[8],P.__data[11]=0):(W.toArray(P.__data,$),$+=j.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,k,P.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(E,y,T,D){const R=E.value,w=y+"_"+T;if(D[w]===void 0)return typeof R=="number"||typeof R=="boolean"?D[w]=R:D[w]=R.clone(),!0;{const U=D[w];if(typeof R=="number"||typeof R=="boolean"){if(U!==R)return D[w]=R,!0}else if(U.equals(R)===!1)return U.copy(R),!0}return!1}function g(E){const y=E.uniforms;let T=0;const D=16;for(let w=0,U=y.length;w<U;w++){const b=Array.isArray(y[w])?y[w]:[y[w]];for(let M=0,P=b.length;M<P;M++){const k=b[M],B=Array.isArray(k.value)?k.value:[k.value];for(let $=0,Y=B.length;$<Y;$++){const W=B[$],j=v(W),X=T%D;X!==0&&D-X<j.boundary&&(T+=D-X),k.__data=new Float32Array(j.storage/Float32Array.BYTES_PER_ELEMENT),k.__offset=T,T+=j.storage}}}const R=T%D;return R>0&&(T+=D-R),E.__size=T,E.__cache={},this}function v(E){const y={boundary:0,storage:0};return typeof E=="number"||typeof E=="boolean"?(y.boundary=4,y.storage=4):E.isVector2?(y.boundary=8,y.storage=8):E.isVector3||E.isColor?(y.boundary=16,y.storage=12):E.isVector4?(y.boundary=16,y.storage=16):E.isMatrix3?(y.boundary=48,y.storage=48):E.isMatrix4?(y.boundary=64,y.storage=64):E.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",E),y}function m(E){const y=E.target;y.removeEventListener("dispose",m);const T=o.indexOf(y.__bindingPointIndex);o.splice(T,1),i.deleteBuffer(s[y.id]),delete s[y.id],delete r[y.id]}function p(){for(const E in s)i.deleteBuffer(s[E]);o=[],s={},r={}}return{bind:l,update:c,dispose:p}}class $0{constructor(e={}){const{canvas:t=Bd(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1}=e;this.isWebGLRenderer=!0;let d;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");d=n.getContextAttributes().alpha}else d=o;const f=new Uint32Array(4),g=new Int32Array(4);let v=null,m=null;const p=[],E=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Kt,this.toneMapping=kn,this.toneMappingExposure=1;const y=this;let T=!1,D=0,R=0,w=null,U=-1,b=null;const M=new rt,P=new rt;let k=null;const B=new Ee(0);let $=0,Y=t.width,W=t.height,j=1,X=null,ue=null;const he=new rt(0,0,Y,W),pe=new rt(0,0,Y,W);let He=!1;const $e=new eo;let q=!1,ee=!1;const de=new et,oe=new C,Oe={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Re=!1;function Ge(){return w===null?j:1}let L=n;function Ve(S,I){return t.getContext(S,I)}try{const S={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Ka}`),t.addEventListener("webglcontextlost",G,!1),t.addEventListener("webglcontextrestored",O,!1),t.addEventListener("webglcontextcreationerror",V,!1),L===null){const I="webgl2";if(L=Ve(I,S),L===null)throw Ve(I)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(S){throw console.error("THREE.WebGLRenderer: "+S.message),S}let ke,it,Me,Xe,Fe,Pe,at,A,x,H,K,J,Q,_e,re,se,Le,te,me,ze,Te,le,De,Ie;function ot(){ke=new eg(L),ke.init(),le=new O0(L,ke),it=new Ym(L,ke,e,le),Me=new U0(L),Xe=new ig(L),Fe=new y0,Pe=new N0(L,ke,Me,Fe,it,le,Xe),at=new Km(y),A=new Qm(y),x=new uf(L),De=new $m(L,x),H=new tg(L,x,Xe,De),K=new rg(L,H,x,Xe),me=new sg(L,it,Pe),se=new jm(Fe),J=new x0(y,at,A,ke,it,De,se),Q=new W0(y,Fe),_e=new S0,re=new C0(ke),te=new Xm(y,at,A,Me,K,d,l),Le=new I0(y,K,it),Ie=new X0(L,Xe,it,Me),ze=new qm(L,ke,Xe),Te=new ng(L,ke,Xe),Xe.programs=J.programs,y.capabilities=it,y.extensions=ke,y.properties=Fe,y.renderLists=_e,y.shadowMap=Le,y.state=Me,y.info=Xe}ot();const _=new G0(y,L);this.xr=_,this.getContext=function(){return L},this.getContextAttributes=function(){return L.getContextAttributes()},this.forceContextLoss=function(){const S=ke.get("WEBGL_lose_context");S&&S.loseContext()},this.forceContextRestore=function(){const S=ke.get("WEBGL_lose_context");S&&S.restoreContext()},this.getPixelRatio=function(){return j},this.setPixelRatio=function(S){S!==void 0&&(j=S,this.setSize(Y,W,!1))},this.getSize=function(S){return S.set(Y,W)},this.setSize=function(S,I,F=!0){if(_.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}Y=S,W=I,t.width=Math.floor(S*j),t.height=Math.floor(I*j),F===!0&&(t.style.width=S+"px",t.style.height=I+"px"),this.setViewport(0,0,S,I)},this.getDrawingBufferSize=function(S){return S.set(Y*j,W*j).floor()},this.setDrawingBufferSize=function(S,I,F){Y=S,W=I,j=F,t.width=Math.floor(S*F),t.height=Math.floor(I*F),this.setViewport(0,0,S,I)},this.getCurrentViewport=function(S){return S.copy(M)},this.getViewport=function(S){return S.copy(he)},this.setViewport=function(S,I,F,z){S.isVector4?he.set(S.x,S.y,S.z,S.w):he.set(S,I,F,z),Me.viewport(M.copy(he).multiplyScalar(j).round())},this.getScissor=function(S){return S.copy(pe)},this.setScissor=function(S,I,F,z){S.isVector4?pe.set(S.x,S.y,S.z,S.w):pe.set(S,I,F,z),Me.scissor(P.copy(pe).multiplyScalar(j).round())},this.getScissorTest=function(){return He},this.setScissorTest=function(S){Me.setScissorTest(He=S)},this.setOpaqueSort=function(S){X=S},this.setTransparentSort=function(S){ue=S},this.getClearColor=function(S){return S.copy(te.getClearColor())},this.setClearColor=function(){te.setClearColor.apply(te,arguments)},this.getClearAlpha=function(){return te.getClearAlpha()},this.setClearAlpha=function(){te.setClearAlpha.apply(te,arguments)},this.clear=function(S=!0,I=!0,F=!0){let z=0;if(S){let N=!1;if(w!==null){const ne=w.texture.format;N=ne===zc||ne===Bc||ne===Fc}if(N){const ne=w.texture.type,ce=ne===Vn||ne===qi||ne===hr||ne===Yi||ne===Uc||ne===Nc,fe=te.getClearColor(),ge=te.getClearAlpha(),we=fe.r,Ae=fe.g,Se=fe.b;ce?(f[0]=we,f[1]=Ae,f[2]=Se,f[3]=ge,L.clearBufferuiv(L.COLOR,0,f)):(g[0]=we,g[1]=Ae,g[2]=Se,g[3]=ge,L.clearBufferiv(L.COLOR,0,g))}else z|=L.COLOR_BUFFER_BIT}I&&(z|=L.DEPTH_BUFFER_BIT),F&&(z|=L.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),L.clear(z)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",G,!1),t.removeEventListener("webglcontextrestored",O,!1),t.removeEventListener("webglcontextcreationerror",V,!1),_e.dispose(),re.dispose(),Fe.dispose(),at.dispose(),A.dispose(),K.dispose(),De.dispose(),Ie.dispose(),J.dispose(),_.dispose(),_.removeEventListener("sessionstart",mt),_.removeEventListener("sessionend",gt),zt.stop()};function G(S){S.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),T=!0}function O(){console.log("THREE.WebGLRenderer: Context Restored."),T=!1;const S=Xe.autoReset,I=Le.enabled,F=Le.autoUpdate,z=Le.needsUpdate,N=Le.type;ot(),Xe.autoReset=S,Le.enabled=I,Le.autoUpdate=F,Le.needsUpdate=z,Le.type=N}function V(S){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",S.statusMessage)}function Z(S){const I=S.target;I.removeEventListener("dispose",Z),ve(I)}function ve(S){Ce(S),Fe.remove(S)}function Ce(S){const I=Fe.get(S).programs;I!==void 0&&(I.forEach(function(F){J.releaseProgram(F)}),S.isShaderMaterial&&J.releaseShaderCache(S))}this.renderBufferDirect=function(S,I,F,z,N,ne){I===null&&(I=Oe);const ce=N.isMesh&&N.matrixWorld.determinant()<0,fe=yu(S,I,F,z,N);Me.setMaterial(z,ce);let ge=F.index,we=1;if(z.wireframe===!0){if(ge=H.getWireframeAttribute(F),ge===void 0)return;we=2}const Ae=F.drawRange,Se=F.attributes.position;let je=Ae.start*we,ct=(Ae.start+Ae.count)*we;ne!==null&&(je=Math.max(je,ne.start*we),ct=Math.min(ct,(ne.start+ne.count)*we)),ge!==null?(je=Math.max(je,0),ct=Math.min(ct,ge.count)):Se!=null&&(je=Math.max(je,0),ct=Math.min(ct,Se.count));const ut=ct-je;if(ut<0||ut===1/0)return;De.setup(N,z,fe,F,ge);let Ht,Je=ze;if(ge!==null&&(Ht=x.get(ge),Je=Te,Je.setIndex(Ht)),N.isMesh)z.wireframe===!0?(Me.setLineWidth(z.wireframeLinewidth*Ge()),Je.setMode(L.LINES)):Je.setMode(L.TRIANGLES);else if(N.isLine){let ye=z.linewidth;ye===void 0&&(ye=1),Me.setLineWidth(ye*Ge()),N.isLineSegments?Je.setMode(L.LINES):N.isLineLoop?Je.setMode(L.LINE_LOOP):Je.setMode(L.LINE_STRIP)}else N.isPoints?Je.setMode(L.POINTS):N.isSprite&&Je.setMode(L.TRIANGLES);if(N.isBatchedMesh)N._multiDrawInstances!==null?Je.renderMultiDrawInstances(N._multiDrawStarts,N._multiDrawCounts,N._multiDrawCount,N._multiDrawInstances):Je.renderMultiDraw(N._multiDrawStarts,N._multiDrawCounts,N._multiDrawCount);else if(N.isInstancedMesh)Je.renderInstances(je,ut,N.count);else if(F.isInstancedBufferGeometry){const ye=F._maxInstanceCount!==void 0?F._maxInstanceCount:1/0,Ut=Math.min(F.instanceCount,ye);Je.renderInstances(je,ut,Ut)}else Je.render(je,ut)};function lt(S,I,F){S.transparent===!0&&S.side===$t&&S.forceSinglePass===!1?(S.side=Dt,S.needsUpdate=!0,ws(S,I,F),S.side=Gn,S.needsUpdate=!0,ws(S,I,F),S.side=$t):ws(S,I,F)}this.compile=function(S,I,F=null){F===null&&(F=S),m=re.get(F),m.init(I),E.push(m),F.traverseVisible(function(N){N.isLight&&N.layers.test(I.layers)&&(m.pushLight(N),N.castShadow&&m.pushShadow(N))}),S!==F&&S.traverseVisible(function(N){N.isLight&&N.layers.test(I.layers)&&(m.pushLight(N),N.castShadow&&m.pushShadow(N))}),m.setupLights();const z=new Set;return S.traverse(function(N){const ne=N.material;if(ne)if(Array.isArray(ne))for(let ce=0;ce<ne.length;ce++){const fe=ne[ce];lt(fe,F,N),z.add(fe)}else lt(ne,F,N),z.add(ne)}),E.pop(),m=null,z},this.compileAsync=function(S,I,F=null){const z=this.compile(S,I,F);return new Promise(N=>{function ne(){if(z.forEach(function(ce){Fe.get(ce).currentProgram.isReady()&&z.delete(ce)}),z.size===0){N(S);return}setTimeout(ne,10)}ke.get("KHR_parallel_shader_compile")!==null?ne():setTimeout(ne,10)})};let pt=null;function qe(S){pt&&pt(S)}function mt(){zt.stop()}function gt(){zt.start()}const zt=new Jc;zt.setAnimationLoop(qe),typeof self<"u"&&zt.setContext(self),this.setAnimationLoop=function(S){pt=S,_.setAnimationLoop(S),S===null?zt.stop():zt.start()},_.addEventListener("sessionstart",mt),_.addEventListener("sessionend",gt),this.render=function(S,I){if(I!==void 0&&I.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(T===!0)return;if(S.matrixWorldAutoUpdate===!0&&S.updateMatrixWorld(),I.parent===null&&I.matrixWorldAutoUpdate===!0&&I.updateMatrixWorld(),_.enabled===!0&&_.isPresenting===!0&&(_.cameraAutoUpdate===!0&&_.updateCamera(I),I=_.getCamera()),S.isScene===!0&&S.onBeforeRender(y,S,I,w),m=re.get(S,E.length),m.init(I),E.push(m),de.multiplyMatrices(I.projectionMatrix,I.matrixWorldInverse),$e.setFromProjectionMatrix(de),ee=this.localClippingEnabled,q=se.init(this.clippingPlanes,ee),v=_e.get(S,p.length),v.init(),p.push(v),_.enabled===!0&&_.isPresenting===!0){const ne=y.xr.getDepthSensingMesh();ne!==null&&kt(ne,I,-1/0,y.sortObjects)}kt(S,I,0,y.sortObjects),v.finish(),y.sortObjects===!0&&v.sort(X,ue),Re=_.enabled===!1||_.isPresenting===!1||_.hasDepthSensing()===!1,Re&&te.addToRenderList(v,S),this.info.render.frame++,q===!0&&se.beginShadows();const F=m.state.shadowsArray;Le.render(F,S,I),q===!0&&se.endShadows(),this.info.autoReset===!0&&this.info.reset();const z=v.opaque,N=v.transmissive;if(m.setupLights(),I.isArrayCamera){const ne=I.cameras;if(N.length>0)for(let ce=0,fe=ne.length;ce<fe;ce++){const ge=ne[ce];Xn(z,N,S,ge)}Re&&te.render(S);for(let ce=0,fe=ne.length;ce<fe;ce++){const ge=ne[ce];Rn(v,S,ge,ge.viewport)}}else N.length>0&&Xn(z,N,S,I),Re&&te.render(S),Rn(v,S,I);w!==null&&(Pe.updateMultisampleRenderTarget(w),Pe.updateRenderTargetMipmap(w)),S.isScene===!0&&S.onAfterRender(y,S,I),De.resetDefaultState(),U=-1,b=null,E.pop(),E.length>0?(m=E[E.length-1],q===!0&&se.setGlobalState(y.clippingPlanes,m.state.camera)):m=null,p.pop(),p.length>0?v=p[p.length-1]:v=null};function kt(S,I,F,z){if(S.visible===!1)return;if(S.layers.test(I.layers)){if(S.isGroup)F=S.renderOrder;else if(S.isLOD)S.autoUpdate===!0&&S.update(I);else if(S.isLight)m.pushLight(S),S.castShadow&&m.pushShadow(S);else if(S.isSprite){if(!S.frustumCulled||$e.intersectsSprite(S)){z&&oe.setFromMatrixPosition(S.matrixWorld).applyMatrix4(de);const ce=K.update(S),fe=S.material;fe.visible&&v.push(S,ce,fe,F,oe.z,null)}}else if((S.isMesh||S.isLine||S.isPoints)&&(!S.frustumCulled||$e.intersectsObject(S))){const ce=K.update(S),fe=S.material;if(z&&(S.boundingSphere!==void 0?(S.boundingSphere===null&&S.computeBoundingSphere(),oe.copy(S.boundingSphere.center)):(ce.boundingSphere===null&&ce.computeBoundingSphere(),oe.copy(ce.boundingSphere.center)),oe.applyMatrix4(S.matrixWorld).applyMatrix4(de)),Array.isArray(fe)){const ge=ce.groups;for(let we=0,Ae=ge.length;we<Ae;we++){const Se=ge[we],je=fe[Se.materialIndex];je&&je.visible&&v.push(S,ce,je,F,oe.z,Se)}}else fe.visible&&v.push(S,ce,fe,F,oe.z,null)}}const ne=S.children;for(let ce=0,fe=ne.length;ce<fe;ce++)kt(ne[ce],I,F,z)}function Rn(S,I,F,z){const N=S.opaque,ne=S.transmissive,ce=S.transparent;m.setupLightsView(F),q===!0&&se.setGlobalState(y.clippingPlanes,F),z&&Me.viewport(M.copy(z)),N.length>0&&$n(N,I,F),ne.length>0&&$n(ne,I,F),ce.length>0&&$n(ce,I,F),Me.buffers.depth.setTest(!0),Me.buffers.depth.setMask(!0),Me.buffers.color.setMask(!0),Me.setPolygonOffset(!1)}function Xn(S,I,F,z){if((F.isScene===!0?F.overrideMaterial:null)!==null)return;m.state.transmissionRenderTarget[z.id]===void 0&&(m.state.transmissionRenderTarget[z.id]=new an(1,1,{generateMipmaps:!0,type:ke.has("EXT_color_buffer_half_float")||ke.has("EXT_color_buffer_float")?Hn:Vn,minFilter:ri,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Ze.workingColorSpace}));const ne=m.state.transmissionRenderTarget[z.id],ce=z.viewport||M;ne.setSize(ce.z,ce.w);const fe=y.getRenderTarget();y.setRenderTarget(ne),y.getClearColor(B),$=y.getClearAlpha(),$<1&&y.setClearColor(16777215,.5),Re?te.render(F):y.clear();const ge=y.toneMapping;y.toneMapping=kn;const we=z.viewport;if(z.viewport!==void 0&&(z.viewport=void 0),m.setupLightsView(z),q===!0&&se.setGlobalState(y.clippingPlanes,z),$n(S,F,z),Pe.updateMultisampleRenderTarget(ne),Pe.updateRenderTargetMipmap(ne),ke.has("WEBGL_multisampled_render_to_texture")===!1){let Ae=!1;for(let Se=0,je=I.length;Se<je;Se++){const ct=I[Se],ut=ct.object,Ht=ct.geometry,Je=ct.material,ye=ct.group;if(Je.side===$t&&ut.layers.test(z.layers)){const Ut=Je.side;Je.side=Dt,Je.needsUpdate=!0,uo(ut,F,z,Ht,Je,ye),Je.side=Ut,Je.needsUpdate=!0,Ae=!0}}Ae===!0&&(Pe.updateMultisampleRenderTarget(ne),Pe.updateRenderTargetMipmap(ne))}y.setRenderTarget(fe),y.setClearColor(B,$),we!==void 0&&(z.viewport=we),y.toneMapping=ge}function $n(S,I,F){const z=I.isScene===!0?I.overrideMaterial:null;for(let N=0,ne=S.length;N<ne;N++){const ce=S[N],fe=ce.object,ge=ce.geometry,we=z===null?ce.material:z,Ae=ce.group;fe.layers.test(F.layers)&&uo(fe,I,F,ge,we,Ae)}}function uo(S,I,F,z,N,ne){S.onBeforeRender(y,I,F,z,N,ne),S.modelViewMatrix.multiplyMatrices(F.matrixWorldInverse,S.matrixWorld),S.normalMatrix.getNormalMatrix(S.modelViewMatrix),N.onBeforeRender(y,I,F,z,S,ne),N.transparent===!0&&N.side===$t&&N.forceSinglePass===!1?(N.side=Dt,N.needsUpdate=!0,y.renderBufferDirect(F,I,z,N,S,ne),N.side=Gn,N.needsUpdate=!0,y.renderBufferDirect(F,I,z,N,S,ne),N.side=$t):y.renderBufferDirect(F,I,z,N,S,ne),S.onAfterRender(y,I,F,z,N,ne)}function ws(S,I,F){I.isScene!==!0&&(I=Oe);const z=Fe.get(S),N=m.state.lights,ne=m.state.shadowsArray,ce=N.state.version,fe=J.getParameters(S,N.state,ne,I,F),ge=J.getProgramCacheKey(fe);let we=z.programs;z.environment=S.isMeshStandardMaterial?I.environment:null,z.fog=I.fog,z.envMap=(S.isMeshStandardMaterial?A:at).get(S.envMap||z.environment),z.envMapRotation=z.environment!==null&&S.envMap===null?I.environmentRotation:S.envMapRotation,we===void 0&&(S.addEventListener("dispose",Z),we=new Map,z.programs=we);let Ae=we.get(ge);if(Ae!==void 0){if(z.currentProgram===Ae&&z.lightsStateVersion===ce)return fo(S,fe),Ae}else fe.uniforms=J.getUniforms(S),S.onBuild(F,fe,y),S.onBeforeCompile(fe,y),Ae=J.acquireProgram(fe,ge),we.set(ge,Ae),z.uniforms=fe.uniforms;const Se=z.uniforms;return(!S.isShaderMaterial&&!S.isRawShaderMaterial||S.clipping===!0)&&(Se.clippingPlanes=se.uniform),fo(S,fe),z.needsLights=Su(S),z.lightsStateVersion=ce,z.needsLights&&(Se.ambientLightColor.value=N.state.ambient,Se.lightProbe.value=N.state.probe,Se.directionalLights.value=N.state.directional,Se.directionalLightShadows.value=N.state.directionalShadow,Se.spotLights.value=N.state.spot,Se.spotLightShadows.value=N.state.spotShadow,Se.rectAreaLights.value=N.state.rectArea,Se.ltc_1.value=N.state.rectAreaLTC1,Se.ltc_2.value=N.state.rectAreaLTC2,Se.pointLights.value=N.state.point,Se.pointLightShadows.value=N.state.pointShadow,Se.hemisphereLights.value=N.state.hemi,Se.directionalShadowMap.value=N.state.directionalShadowMap,Se.directionalShadowMatrix.value=N.state.directionalShadowMatrix,Se.spotShadowMap.value=N.state.spotShadowMap,Se.spotLightMatrix.value=N.state.spotLightMatrix,Se.spotLightMap.value=N.state.spotLightMap,Se.pointShadowMap.value=N.state.pointShadowMap,Se.pointShadowMatrix.value=N.state.pointShadowMatrix),z.currentProgram=Ae,z.uniformsList=null,Ae}function ho(S){if(S.uniformsList===null){const I=S.currentProgram.getUniforms();S.uniformsList=lr.seqWithValue(I.seq,S.uniforms)}return S.uniformsList}function fo(S,I){const F=Fe.get(S);F.outputColorSpace=I.outputColorSpace,F.batching=I.batching,F.batchingColor=I.batchingColor,F.instancing=I.instancing,F.instancingColor=I.instancingColor,F.instancingMorph=I.instancingMorph,F.skinning=I.skinning,F.morphTargets=I.morphTargets,F.morphNormals=I.morphNormals,F.morphColors=I.morphColors,F.morphTargetsCount=I.morphTargetsCount,F.numClippingPlanes=I.numClippingPlanes,F.numIntersection=I.numClipIntersection,F.vertexAlphas=I.vertexAlphas,F.vertexTangents=I.vertexTangents,F.toneMapping=I.toneMapping}function yu(S,I,F,z,N){I.isScene!==!0&&(I=Oe),Pe.resetTextureUnits();const ne=I.fog,ce=z.isMeshStandardMaterial?I.environment:null,fe=w===null?y.outputColorSpace:w.isXRRenderTarget===!0?w.texture.colorSpace:Wn,ge=(z.isMeshStandardMaterial?A:at).get(z.envMap||ce),we=z.vertexColors===!0&&!!F.attributes.color&&F.attributes.color.itemSize===4,Ae=!!F.attributes.tangent&&(!!z.normalMap||z.anisotropy>0),Se=!!F.morphAttributes.position,je=!!F.morphAttributes.normal,ct=!!F.morphAttributes.color;let ut=kn;z.toneMapped&&(w===null||w.isXRRenderTarget===!0)&&(ut=y.toneMapping);const Ht=F.morphAttributes.position||F.morphAttributes.normal||F.morphAttributes.color,Je=Ht!==void 0?Ht.length:0,ye=Fe.get(z),Ut=m.state.lights;if(q===!0&&(ee===!0||S!==b)){const qt=S===b&&z.id===U;se.setState(z,S,qt)}let tt=!1;z.version===ye.__version?(ye.needsLights&&ye.lightsStateVersion!==Ut.state.version||ye.outputColorSpace!==fe||N.isBatchedMesh&&ye.batching===!1||!N.isBatchedMesh&&ye.batching===!0||N.isBatchedMesh&&ye.batchingColor===!0&&N.colorTexture===null||N.isBatchedMesh&&ye.batchingColor===!1&&N.colorTexture!==null||N.isInstancedMesh&&ye.instancing===!1||!N.isInstancedMesh&&ye.instancing===!0||N.isSkinnedMesh&&ye.skinning===!1||!N.isSkinnedMesh&&ye.skinning===!0||N.isInstancedMesh&&ye.instancingColor===!0&&N.instanceColor===null||N.isInstancedMesh&&ye.instancingColor===!1&&N.instanceColor!==null||N.isInstancedMesh&&ye.instancingMorph===!0&&N.morphTexture===null||N.isInstancedMesh&&ye.instancingMorph===!1&&N.morphTexture!==null||ye.envMap!==ge||z.fog===!0&&ye.fog!==ne||ye.numClippingPlanes!==void 0&&(ye.numClippingPlanes!==se.numPlanes||ye.numIntersection!==se.numIntersection)||ye.vertexAlphas!==we||ye.vertexTangents!==Ae||ye.morphTargets!==Se||ye.morphNormals!==je||ye.morphColors!==ct||ye.toneMapping!==ut||ye.morphTargetsCount!==Je)&&(tt=!0):(tt=!0,ye.__version=z.version);let gn=ye.currentProgram;tt===!0&&(gn=ws(z,I,N));let As=!1,qn=!1,Cr=!1;const St=gn.getUniforms(),Pn=ye.uniforms;if(Me.useProgram(gn.program)&&(As=!0,qn=!0,Cr=!0),z.id!==U&&(U=z.id,qn=!0),As||b!==S){St.setValue(L,"projectionMatrix",S.projectionMatrix),St.setValue(L,"viewMatrix",S.matrixWorldInverse);const qt=St.map.cameraPosition;qt!==void 0&&qt.setValue(L,oe.setFromMatrixPosition(S.matrixWorld)),it.logarithmicDepthBuffer&&St.setValue(L,"logDepthBufFC",2/(Math.log(S.far+1)/Math.LN2)),(z.isMeshPhongMaterial||z.isMeshToonMaterial||z.isMeshLambertMaterial||z.isMeshBasicMaterial||z.isMeshStandardMaterial||z.isShaderMaterial)&&St.setValue(L,"isOrthographic",S.isOrthographicCamera===!0),b!==S&&(b=S,qn=!0,Cr=!0)}if(N.isSkinnedMesh){St.setOptional(L,N,"bindMatrix"),St.setOptional(L,N,"bindMatrixInverse");const qt=N.skeleton;qt&&(qt.boneTexture===null&&qt.computeBoneTexture(),St.setValue(L,"boneTexture",qt.boneTexture,Pe))}N.isBatchedMesh&&(St.setOptional(L,N,"batchingTexture"),St.setValue(L,"batchingTexture",N._matricesTexture,Pe),St.setOptional(L,N,"batchingColorTexture"),N._colorsTexture!==null&&St.setValue(L,"batchingColorTexture",N._colorsTexture,Pe));const Rr=F.morphAttributes;if((Rr.position!==void 0||Rr.normal!==void 0||Rr.color!==void 0)&&me.update(N,F,gn),(qn||ye.receiveShadow!==N.receiveShadow)&&(ye.receiveShadow=N.receiveShadow,St.setValue(L,"receiveShadow",N.receiveShadow)),z.isMeshGouraudMaterial&&z.envMap!==null&&(Pn.envMap.value=ge,Pn.flipEnvMap.value=ge.isCubeTexture&&ge.isRenderTargetTexture===!1?-1:1),z.isMeshStandardMaterial&&z.envMap===null&&I.environment!==null&&(Pn.envMapIntensity.value=I.environmentIntensity),qn&&(St.setValue(L,"toneMappingExposure",y.toneMappingExposure),ye.needsLights&&Mu(Pn,Cr),ne&&z.fog===!0&&Q.refreshFogUniforms(Pn,ne),Q.refreshMaterialUniforms(Pn,z,j,W,m.state.transmissionRenderTarget[S.id]),lr.upload(L,ho(ye),Pn,Pe)),z.isShaderMaterial&&z.uniformsNeedUpdate===!0&&(lr.upload(L,ho(ye),Pn,Pe),z.uniformsNeedUpdate=!1),z.isSpriteMaterial&&St.setValue(L,"center",N.center),St.setValue(L,"modelViewMatrix",N.modelViewMatrix),St.setValue(L,"normalMatrix",N.normalMatrix),St.setValue(L,"modelMatrix",N.matrixWorld),z.isShaderMaterial||z.isRawShaderMaterial){const qt=z.uniformsGroups;for(let Pr=0,bu=qt.length;Pr<bu;Pr++){const po=qt[Pr];Ie.update(po,gn),Ie.bind(po,gn)}}return gn}function Mu(S,I){S.ambientLightColor.needsUpdate=I,S.lightProbe.needsUpdate=I,S.directionalLights.needsUpdate=I,S.directionalLightShadows.needsUpdate=I,S.pointLights.needsUpdate=I,S.pointLightShadows.needsUpdate=I,S.spotLights.needsUpdate=I,S.spotLightShadows.needsUpdate=I,S.rectAreaLights.needsUpdate=I,S.hemisphereLights.needsUpdate=I}function Su(S){return S.isMeshLambertMaterial||S.isMeshToonMaterial||S.isMeshPhongMaterial||S.isMeshStandardMaterial||S.isShadowMaterial||S.isShaderMaterial&&S.lights===!0}this.getActiveCubeFace=function(){return D},this.getActiveMipmapLevel=function(){return R},this.getRenderTarget=function(){return w},this.setRenderTargetTextures=function(S,I,F){Fe.get(S.texture).__webglTexture=I,Fe.get(S.depthTexture).__webglTexture=F;const z=Fe.get(S);z.__hasExternalTextures=!0,z.__autoAllocateDepthBuffer=F===void 0,z.__autoAllocateDepthBuffer||ke.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),z.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(S,I){const F=Fe.get(S);F.__webglFramebuffer=I,F.__useDefaultFramebuffer=I===void 0},this.setRenderTarget=function(S,I=0,F=0){w=S,D=I,R=F;let z=!0,N=null,ne=!1,ce=!1;if(S){const ge=Fe.get(S);ge.__useDefaultFramebuffer!==void 0?(Me.bindFramebuffer(L.FRAMEBUFFER,null),z=!1):ge.__webglFramebuffer===void 0?Pe.setupRenderTarget(S):ge.__hasExternalTextures&&Pe.rebindTextures(S,Fe.get(S.texture).__webglTexture,Fe.get(S.depthTexture).__webglTexture);const we=S.texture;(we.isData3DTexture||we.isDataArrayTexture||we.isCompressedArrayTexture)&&(ce=!0);const Ae=Fe.get(S).__webglFramebuffer;S.isWebGLCubeRenderTarget?(Array.isArray(Ae[I])?N=Ae[I][F]:N=Ae[I],ne=!0):S.samples>0&&Pe.useMultisampledRTT(S)===!1?N=Fe.get(S).__webglMultisampledFramebuffer:Array.isArray(Ae)?N=Ae[F]:N=Ae,M.copy(S.viewport),P.copy(S.scissor),k=S.scissorTest}else M.copy(he).multiplyScalar(j).floor(),P.copy(pe).multiplyScalar(j).floor(),k=He;if(Me.bindFramebuffer(L.FRAMEBUFFER,N)&&z&&Me.drawBuffers(S,N),Me.viewport(M),Me.scissor(P),Me.setScissorTest(k),ne){const ge=Fe.get(S.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_CUBE_MAP_POSITIVE_X+I,ge.__webglTexture,F)}else if(ce){const ge=Fe.get(S.texture),we=I||0;L.framebufferTextureLayer(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,ge.__webglTexture,F||0,we)}U=-1},this.readRenderTargetPixels=function(S,I,F,z,N,ne,ce){if(!(S&&S.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let fe=Fe.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&ce!==void 0&&(fe=fe[ce]),fe){Me.bindFramebuffer(L.FRAMEBUFFER,fe);try{const ge=S.texture,we=ge.format,Ae=ge.type;if(!it.textureFormatReadable(we)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!it.textureTypeReadable(Ae)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}I>=0&&I<=S.width-z&&F>=0&&F<=S.height-N&&L.readPixels(I,F,z,N,le.convert(we),le.convert(Ae),ne)}finally{const ge=w!==null?Fe.get(w).__webglFramebuffer:null;Me.bindFramebuffer(L.FRAMEBUFFER,ge)}}},this.readRenderTargetPixelsAsync=async function(S,I,F,z,N,ne,ce){if(!(S&&S.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let fe=Fe.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&ce!==void 0&&(fe=fe[ce]),fe){Me.bindFramebuffer(L.FRAMEBUFFER,fe);try{const ge=S.texture,we=ge.format,Ae=ge.type;if(!it.textureFormatReadable(we))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!it.textureTypeReadable(Ae))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(I>=0&&I<=S.width-z&&F>=0&&F<=S.height-N){const Se=L.createBuffer();L.bindBuffer(L.PIXEL_PACK_BUFFER,Se),L.bufferData(L.PIXEL_PACK_BUFFER,ne.byteLength,L.STREAM_READ),L.readPixels(I,F,z,N,le.convert(we),le.convert(Ae),0),L.flush();const je=L.fenceSync(L.SYNC_GPU_COMMANDS_COMPLETE,0);await zd(L,je,4);try{L.bindBuffer(L.PIXEL_PACK_BUFFER,Se),L.getBufferSubData(L.PIXEL_PACK_BUFFER,0,ne)}finally{L.deleteBuffer(Se),L.deleteSync(je)}return ne}}finally{const ge=w!==null?Fe.get(w).__webglFramebuffer:null;Me.bindFramebuffer(L.FRAMEBUFFER,ge)}}},this.copyFramebufferToTexture=function(S,I=null,F=0){S.isTexture!==!0&&(console.warn("WebGLRenderer: copyFramebufferToTexture function signature has changed."),I=arguments[0]||null,S=arguments[1]);const z=Math.pow(2,-F),N=Math.floor(S.image.width*z),ne=Math.floor(S.image.height*z),ce=I!==null?I.x:0,fe=I!==null?I.y:0;Pe.setTexture2D(S,0),L.copyTexSubImage2D(L.TEXTURE_2D,F,0,0,ce,fe,N,ne),Me.unbindTexture()},this.copyTextureToTexture=function(S,I,F=null,z=null,N=0){S.isTexture!==!0&&(console.warn("WebGLRenderer: copyTextureToTexture function signature has changed."),z=arguments[0]||null,S=arguments[1],I=arguments[2],N=arguments[3]||0,F=null);let ne,ce,fe,ge,we,Ae;F!==null?(ne=F.max.x-F.min.x,ce=F.max.y-F.min.y,fe=F.min.x,ge=F.min.y):(ne=S.image.width,ce=S.image.height,fe=0,ge=0),z!==null?(we=z.x,Ae=z.y):(we=0,Ae=0);const Se=le.convert(I.format),je=le.convert(I.type);Pe.setTexture2D(I,0),L.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,I.flipY),L.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,I.premultiplyAlpha),L.pixelStorei(L.UNPACK_ALIGNMENT,I.unpackAlignment);const ct=L.getParameter(L.UNPACK_ROW_LENGTH),ut=L.getParameter(L.UNPACK_IMAGE_HEIGHT),Ht=L.getParameter(L.UNPACK_SKIP_PIXELS),Je=L.getParameter(L.UNPACK_SKIP_ROWS),ye=L.getParameter(L.UNPACK_SKIP_IMAGES),Ut=S.isCompressedTexture?S.mipmaps[N]:S.image;L.pixelStorei(L.UNPACK_ROW_LENGTH,Ut.width),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,Ut.height),L.pixelStorei(L.UNPACK_SKIP_PIXELS,fe),L.pixelStorei(L.UNPACK_SKIP_ROWS,ge),S.isDataTexture?L.texSubImage2D(L.TEXTURE_2D,N,we,Ae,ne,ce,Se,je,Ut.data):S.isCompressedTexture?L.compressedTexSubImage2D(L.TEXTURE_2D,N,we,Ae,Ut.width,Ut.height,Se,Ut.data):L.texSubImage2D(L.TEXTURE_2D,N,we,Ae,Se,je,Ut),L.pixelStorei(L.UNPACK_ROW_LENGTH,ct),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,ut),L.pixelStorei(L.UNPACK_SKIP_PIXELS,Ht),L.pixelStorei(L.UNPACK_SKIP_ROWS,Je),L.pixelStorei(L.UNPACK_SKIP_IMAGES,ye),N===0&&I.generateMipmaps&&L.generateMipmap(L.TEXTURE_2D),Me.unbindTexture()},this.copyTextureToTexture3D=function(S,I,F=null,z=null,N=0){S.isTexture!==!0&&(console.warn("WebGLRenderer: copyTextureToTexture3D function signature has changed."),F=arguments[0]||null,z=arguments[1]||null,S=arguments[2],I=arguments[3],N=arguments[4]||0);let ne,ce,fe,ge,we,Ae,Se,je,ct;const ut=S.isCompressedTexture?S.mipmaps[N]:S.image;F!==null?(ne=F.max.x-F.min.x,ce=F.max.y-F.min.y,fe=F.max.z-F.min.z,ge=F.min.x,we=F.min.y,Ae=F.min.z):(ne=ut.width,ce=ut.height,fe=ut.depth,ge=0,we=0,Ae=0),z!==null?(Se=z.x,je=z.y,ct=z.z):(Se=0,je=0,ct=0);const Ht=le.convert(I.format),Je=le.convert(I.type);let ye;if(I.isData3DTexture)Pe.setTexture3D(I,0),ye=L.TEXTURE_3D;else if(I.isDataArrayTexture||I.isCompressedArrayTexture)Pe.setTexture2DArray(I,0),ye=L.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}L.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,I.flipY),L.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,I.premultiplyAlpha),L.pixelStorei(L.UNPACK_ALIGNMENT,I.unpackAlignment);const Ut=L.getParameter(L.UNPACK_ROW_LENGTH),tt=L.getParameter(L.UNPACK_IMAGE_HEIGHT),gn=L.getParameter(L.UNPACK_SKIP_PIXELS),As=L.getParameter(L.UNPACK_SKIP_ROWS),qn=L.getParameter(L.UNPACK_SKIP_IMAGES);L.pixelStorei(L.UNPACK_ROW_LENGTH,ut.width),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,ut.height),L.pixelStorei(L.UNPACK_SKIP_PIXELS,ge),L.pixelStorei(L.UNPACK_SKIP_ROWS,we),L.pixelStorei(L.UNPACK_SKIP_IMAGES,Ae),S.isDataTexture||S.isData3DTexture?L.texSubImage3D(ye,N,Se,je,ct,ne,ce,fe,Ht,Je,ut.data):I.isCompressedArrayTexture?L.compressedTexSubImage3D(ye,N,Se,je,ct,ne,ce,fe,Ht,ut.data):L.texSubImage3D(ye,N,Se,je,ct,ne,ce,fe,Ht,Je,ut),L.pixelStorei(L.UNPACK_ROW_LENGTH,Ut),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,tt),L.pixelStorei(L.UNPACK_SKIP_PIXELS,gn),L.pixelStorei(L.UNPACK_SKIP_ROWS,As),L.pixelStorei(L.UNPACK_SKIP_IMAGES,qn),N===0&&I.generateMipmaps&&L.generateMipmap(ye),Me.unbindTexture()},this.initRenderTarget=function(S){Fe.get(S).__webglFramebuffer===void 0&&Pe.setupRenderTarget(S)},this.initTexture=function(S){S.isCubeTexture?Pe.setTextureCube(S,0):S.isData3DTexture?Pe.setTexture3D(S,0):S.isDataArrayTexture||S.isCompressedArrayTexture?Pe.setTexture2DArray(S,0):Pe.setTexture2D(S,0),Me.unbindTexture()},this.resetState=function(){D=0,R=0,w=null,Me.reset(),De.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return wn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=e===Ja?"display-p3":"srgb",t.unpackColorSpace=Ze.workingColorSpace===Er?"display-p3":"srgb"}}class Ar{constructor(e,t=25e-5){this.isFogExp2=!0,this.name="",this.color=new Ee(e),this.density=t}clone(){return new Ar(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}}class q0 extends dt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new mn,this.environmentIntensity=1,this.environmentRotation=new mn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class Y0 extends It{constructor(e=null,t=1,n=1,s,r,o,a,l,c=Bt,u=Bt,h,d){super(null,o,a,l,c,u,s,r,h,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Gl extends Lt{constructor(e,t,n,s=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const Ui=new et,Vl=new et,Js=[],Wl=new di,j0=new et,rs=new be,as=new fi;class pa extends be{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Gl(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,j0)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new di),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ui),Wl.copy(e.boundingBox).applyMatrix4(Ui),this.boundingBox.union(Wl)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new fi),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ui),as.copy(e.boundingSphere).applyMatrix4(Ui),this.boundingSphere.union(as)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const n=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,o=e*r+1;for(let a=0;a<n.length;a++)n[a]=s[o+a]}raycast(e,t){const n=this.matrixWorld,s=this.count;if(rs.geometry=this.geometry,rs.material=this.material,rs.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),as.copy(this.boundingSphere),as.applyMatrix4(n),e.ray.intersectsSphere(as)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Ui),Vl.multiplyMatrices(n,Ui),rs.matrixWorld=Vl,rs.raycast(e,Js);for(let o=0,a=Js.length;o<a;o++){const l=Js[o];l.instanceId=r,l.object=this,t.push(l)}Js.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Gl(new Float32Array(this.instanceMatrix.count*3),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const n=t.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new Y0(new Float32Array(s*this.count),s,this.count,Oc,Tn));const r=this.morphTexture.source.data.data;let o=0;for(let c=0;c<n.length;c++)o+=n[c];const a=this.geometry.morphTargetsRelative?1:1-o,l=s*e;r[l]=a,r.set(n,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}}class sn extends pi{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ee(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const _r=new C,vr=new C,Xl=new et,os=new Ts,Qs=new fi,ma=new C,$l=new C;class K0 extends dt{constructor(e=new Ke,t=new sn){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)_r.fromBufferAttribute(t,s-1),vr.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=_r.distanceTo(vr);e.setAttribute("lineDistance",new We(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Qs.copy(n.boundingSphere),Qs.applyMatrix4(s),Qs.radius+=r,e.ray.intersectsSphere(Qs)===!1)return;Xl.copy(s).invert(),os.copy(e.ray).applyMatrix4(Xl);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,u=n.index,d=n.attributes.position;if(u!==null){const f=Math.max(0,o.start),g=Math.min(u.count,o.start+o.count);for(let v=f,m=g-1;v<m;v+=c){const p=u.getX(v),E=u.getX(v+1),y=er(this,e,os,l,p,E);y&&t.push(y)}if(this.isLineLoop){const v=u.getX(g-1),m=u.getX(f),p=er(this,e,os,l,v,m);p&&t.push(p)}}else{const f=Math.max(0,o.start),g=Math.min(d.count,o.start+o.count);for(let v=f,m=g-1;v<m;v+=c){const p=er(this,e,os,l,v,v+1);p&&t.push(p)}if(this.isLineLoop){const v=er(this,e,os,l,g-1,f);v&&t.push(v)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function er(i,e,t,n,s,r){const o=i.geometry.attributes.position;if(_r.fromBufferAttribute(o,s),vr.fromBufferAttribute(o,r),t.distanceSqToSegment(_r,vr,ma,$l)>n)return;ma.applyMatrix4(i.matrixWorld);const l=e.ray.origin.distanceTo(ma);if(!(l<e.near||l>e.far))return{distance:l,point:$l.clone().applyMatrix4(i.matrixWorld),index:s,face:null,faceIndex:null,object:i}}const ql=new C,Yl=new C;class ln extends K0{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)ql.fromBufferAttribute(t,s),Yl.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+ql.distanceTo(Yl);e.setAttribute("lineDistance",new We(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class us extends pi{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Ee(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const jl=new et,za=new Ts,tr=new fi,nr=new C;class ir extends dt{constructor(e=new Ke,t=new us){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const n=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),tr.copy(n.boundingSphere),tr.applyMatrix4(s),tr.radius+=r,e.ray.intersectsSphere(tr)===!1)return;jl.copy(s).invert(),za.copy(e.ray).applyMatrix4(jl);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=n.index,h=n.attributes.position;if(c!==null){const d=Math.max(0,o.start),f=Math.min(c.count,o.start+o.count);for(let g=d,v=f;g<v;g++){const m=c.getX(g);nr.fromBufferAttribute(h,m),Kl(nr,m,l,s,e,t,this)}}else{const d=Math.max(0,o.start),f=Math.min(h.count,o.start+o.count);for(let g=d,v=f;g<v;g++)nr.fromBufferAttribute(h,g),Kl(nr,g,l,s,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function Kl(i,e,t,n,s,r,o){const a=za.distanceSqToPoint(i);if(a<t){const l=new C;za.closestPointToPoint(i,l),l.applyMatrix4(n);const c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:e,face:null,object:o})}}class Zl extends It{constructor(e,t,n,s,r,o,a,l,c){super(e,t,n,s,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class Cn{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){const n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let n,s=this.getPoint(0),r=0;t.push(0);for(let o=1;o<=e;o++)n=this.getPoint(o/e),r+=n.distanceTo(s),t.push(r),s=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){const n=this.getLengths();let s=0;const r=n.length;let o;t?o=t:o=e*n[r-1];let a=0,l=r-1,c;for(;a<=l;)if(s=Math.floor(a+(l-a)/2),c=n[s]-o,c<0)a=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,n[s]===o)return s/(r-1);const u=n[s],d=n[s+1]-u,f=(o-u)/d;return(s+f)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);const o=this.getPoint(s),a=this.getPoint(r),l=t||(o.isVector2?new ie:new C);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,t){const n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t){const n=new C,s=[],r=[],o=[],a=new C,l=new et;for(let f=0;f<=e;f++){const g=f/e;s[f]=this.getTangentAt(g,new C)}r[0]=new C,o[0]=new C;let c=Number.MAX_VALUE;const u=Math.abs(s[0].x),h=Math.abs(s[0].y),d=Math.abs(s[0].z);u<=c&&(c=u,n.set(1,0,0)),h<=c&&(c=h,n.set(0,1,0)),d<=c&&n.set(0,0,1),a.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let f=1;f<=e;f++){if(r[f]=r[f-1].clone(),o[f]=o[f-1].clone(),a.crossVectors(s[f-1],s[f]),a.length()>Number.EPSILON){a.normalize();const g=Math.acos(At(s[f-1].dot(s[f]),-1,1));r[f].applyMatrix4(l.makeRotationAxis(a,g))}o[f].crossVectors(s[f],r[f])}if(t===!0){let f=Math.acos(At(r[0].dot(r[e]),-1,1));f/=e,s[0].dot(a.crossVectors(r[0],r[e]))>0&&(f=-f);for(let g=1;g<=e;g++)r[g].applyMatrix4(l.makeRotationAxis(s[g],f*g)),o[g].crossVectors(s[g],r[g])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){const e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}}class ru extends Cn{constructor(e=0,t=0,n=1,s=1,r=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,t=new ie){const n=t,s=Math.PI*2;let r=this.aEndAngle-this.aStartAngle;const o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(o?r=0:r=s),this.aClockwise===!0&&!o&&(r===s?r=-s:r=r-s);const a=this.aStartAngle+e*r;let l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){const u=Math.cos(this.aRotation),h=Math.sin(this.aRotation),d=l-this.aX,f=c-this.aY;l=d*u-f*h+this.aX,c=d*h+f*u+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}class Z0 extends ru{constructor(e,t,n,s,r,o){super(e,t,n,n,s,r,o),this.isArcCurve=!0,this.type="ArcCurve"}}function no(){let i=0,e=0,t=0,n=0;function s(r,o,a,l){i=r,e=a,t=-3*r+3*o-2*a-l,n=2*r-2*o+a+l}return{initCatmullRom:function(r,o,a,l,c){s(o,a,c*(a-r),c*(l-o))},initNonuniformCatmullRom:function(r,o,a,l,c,u,h){let d=(o-r)/c-(a-r)/(c+u)+(a-o)/u,f=(a-o)/u-(l-o)/(u+h)+(l-a)/h;d*=u,f*=u,s(o,a,d,f)},calc:function(r){const o=r*r,a=o*r;return i+e*r+t*o+n*a}}}const sr=new C,ga=new no,_a=new no,va=new no;class au extends Cn{constructor(e=[],t=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=s}getPoint(e,t=new C){const n=t,s=this.points,r=s.length,o=(r-(this.closed?0:1))*e;let a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:l===0&&a===r-1&&(a=r-2,l=1);let c,u;this.closed||a>0?c=s[(a-1)%r]:(sr.subVectors(s[0],s[1]).add(s[0]),c=sr);const h=s[a%r],d=s[(a+1)%r];if(this.closed||a+2<r?u=s[(a+2)%r]:(sr.subVectors(s[r-1],s[r-2]).add(s[r-1]),u=sr),this.curveType==="centripetal"||this.curveType==="chordal"){const f=this.curveType==="chordal"?.5:.25;let g=Math.pow(c.distanceToSquared(h),f),v=Math.pow(h.distanceToSquared(d),f),m=Math.pow(d.distanceToSquared(u),f);v<1e-4&&(v=1),g<1e-4&&(g=v),m<1e-4&&(m=v),ga.initNonuniformCatmullRom(c.x,h.x,d.x,u.x,g,v,m),_a.initNonuniformCatmullRom(c.y,h.y,d.y,u.y,g,v,m),va.initNonuniformCatmullRom(c.z,h.z,d.z,u.z,g,v,m)}else this.curveType==="catmullrom"&&(ga.initCatmullRom(c.x,h.x,d.x,u.x,this.tension),_a.initCatmullRom(c.y,h.y,d.y,u.y,this.tension),va.initCatmullRom(c.z,h.z,d.z,u.z,this.tension));return n.set(ga.calc(l),_a.calc(l),va.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(new C().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function Jl(i,e,t,n,s){const r=(n-e)*.5,o=(s-t)*.5,a=i*i,l=i*a;return(2*t-2*n+r+o)*l+(-3*t+3*n-2*r-o)*a+r*i+t}function J0(i,e){const t=1-i;return t*t*e}function Q0(i,e){return 2*(1-i)*i*e}function e_(i,e){return i*i*e}function hs(i,e,t,n){return J0(i,e)+Q0(i,t)+e_(i,n)}function t_(i,e){const t=1-i;return t*t*t*e}function n_(i,e){const t=1-i;return 3*t*t*i*e}function i_(i,e){return 3*(1-i)*i*i*e}function s_(i,e){return i*i*i*e}function ds(i,e,t,n,s){return t_(i,e)+n_(i,t)+i_(i,n)+s_(i,s)}class r_ extends Cn{constructor(e=new ie,t=new ie,n=new ie,s=new ie){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new ie){const n=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(ds(e,s.x,r.x,o.x,a.x),ds(e,s.y,r.y,o.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class a_ extends Cn{constructor(e=new C,t=new C,n=new C,s=new C){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new C){const n=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(ds(e,s.x,r.x,o.x,a.x),ds(e,s.y,r.y,o.y,a.y),ds(e,s.z,r.z,o.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class o_ extends Cn{constructor(e=new ie,t=new ie){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new ie){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new ie){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class l_ extends Cn{constructor(e=new C,t=new C){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new C){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new C){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class c_ extends Cn{constructor(e=new ie,t=new ie,n=new ie){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new ie){const n=t,s=this.v0,r=this.v1,o=this.v2;return n.set(hs(e,s.x,r.x,o.x),hs(e,s.y,r.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class ou extends Cn{constructor(e=new C,t=new C,n=new C){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new C){const n=t,s=this.v0,r=this.v1,o=this.v2;return n.set(hs(e,s.x,r.x,o.x),hs(e,s.y,r.y,o.y),hs(e,s.z,r.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class u_ extends Cn{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new ie){const n=t,s=this.points,r=(s.length-1)*e,o=Math.floor(r),a=r-o,l=s[o===0?o:o-1],c=s[o],u=s[o>s.length-2?s.length-1:o+1],h=s[o>s.length-3?s.length-1:o+2];return n.set(Jl(a,l.x,c.x,u.x,h.x),Jl(a,l.y,c.y,u.y,h.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(s.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(new ie().fromArray(s))}return this}}var h_=Object.freeze({__proto__:null,ArcCurve:Z0,CatmullRomCurve3:au,CubicBezierCurve:r_,CubicBezierCurve3:a_,EllipseCurve:ru,LineCurve:o_,LineCurve3:l_,QuadraticBezierCurve:c_,QuadraticBezierCurve3:ou,SplineCurve:u_});class io extends Ke{constructor(e=1,t=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:s},t=Math.max(3,t);const r=[],o=[],a=[],l=[],c=new C,u=new ie;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let h=0,d=3;h<=t;h++,d+=3){const f=n+h/t*s;c.x=e*Math.cos(f),c.y=e*Math.sin(f),o.push(c.x,c.y,c.z),a.push(0,0,1),u.x=(o[d]/e+1)/2,u.y=(o[d+1]/e+1)/2,l.push(u.x,u.y)}for(let h=1;h<=t;h++)r.push(h,h+1,0);this.setIndex(r),this.setAttribute("position",new We(o,3)),this.setAttribute("normal",new We(a,3)),this.setAttribute("uv",new We(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new io(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class En extends Ke{constructor(e=1,t=1,n=1,s=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};const c=this;s=Math.floor(s),r=Math.floor(r);const u=[],h=[],d=[],f=[];let g=0;const v=[],m=n/2;let p=0;E(),o===!1&&(e>0&&y(!0),t>0&&y(!1)),this.setIndex(u),this.setAttribute("position",new We(h,3)),this.setAttribute("normal",new We(d,3)),this.setAttribute("uv",new We(f,2));function E(){const T=new C,D=new C;let R=0;const w=(t-e)/n;for(let U=0;U<=r;U++){const b=[],M=U/r,P=M*(t-e)+e;for(let k=0;k<=s;k++){const B=k/s,$=B*l+a,Y=Math.sin($),W=Math.cos($);D.x=P*Y,D.y=-M*n+m,D.z=P*W,h.push(D.x,D.y,D.z),T.set(Y,w,W).normalize(),d.push(T.x,T.y,T.z),f.push(B,1-M),b.push(g++)}v.push(b)}for(let U=0;U<s;U++)for(let b=0;b<r;b++){const M=v[b][U],P=v[b+1][U],k=v[b+1][U+1],B=v[b][U+1];u.push(M,P,B),u.push(P,k,B),R+=6}c.addGroup(p,R,0),p+=R}function y(T){const D=g,R=new ie,w=new C;let U=0;const b=T===!0?e:t,M=T===!0?1:-1;for(let k=1;k<=s;k++)h.push(0,m*M,0),d.push(0,M,0),f.push(.5,.5),g++;const P=g;for(let k=0;k<=s;k++){const $=k/s*l+a,Y=Math.cos($),W=Math.sin($);w.x=b*W,w.y=m*M,w.z=b*Y,h.push(w.x,w.y,w.z),d.push(0,M,0),R.x=Y*.5+.5,R.y=W*.5*M+.5,f.push(R.x,R.y),g++}for(let k=0;k<s;k++){const B=D+k,$=P+k;T===!0?u.push($,$+1,B):u.push($+1,$,B),U+=3}c.addGroup(p,U,T===!0?1:2),p+=U}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new En(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class fs extends En{constructor(e=1,t=1,n=32,s=1,r=!1,o=0,a=Math.PI*2){super(0,e,t,n,s,r,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(e){return new fs(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class ps extends Ke{constructor(e=.5,t=1,n=32,s=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:s,thetaStart:r,thetaLength:o},n=Math.max(3,n),s=Math.max(1,s);const a=[],l=[],c=[],u=[];let h=e;const d=(t-e)/s,f=new C,g=new ie;for(let v=0;v<=s;v++){for(let m=0;m<=n;m++){const p=r+m/n*o;f.x=h*Math.cos(p),f.y=h*Math.sin(p),l.push(f.x,f.y,f.z),c.push(0,0,1),g.x=(f.x/t+1)/2,g.y=(f.y/t+1)/2,u.push(g.x,g.y)}h+=d}for(let v=0;v<s;v++){const m=v*(n+1);for(let p=0;p<n;p++){const E=p+m,y=E,T=E+n+1,D=E+n+2,R=E+1;a.push(y,T,R),a.push(T,D,R)}}this.setIndex(a),this.setAttribute("position",new We(l,3)),this.setAttribute("normal",new We(c,3)),this.setAttribute("uv",new We(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ps(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class un extends Ke{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const l=Math.min(o+a,Math.PI);let c=0;const u=[],h=new C,d=new C,f=[],g=[],v=[],m=[];for(let p=0;p<=n;p++){const E=[],y=p/n;let T=0;p===0&&o===0?T=.5/t:p===n&&l===Math.PI&&(T=-.5/t);for(let D=0;D<=t;D++){const R=D/t;h.x=-e*Math.cos(s+R*r)*Math.sin(o+y*a),h.y=e*Math.cos(o+y*a),h.z=e*Math.sin(s+R*r)*Math.sin(o+y*a),g.push(h.x,h.y,h.z),d.copy(h).normalize(),v.push(d.x,d.y,d.z),m.push(R+T,1-y),E.push(c++)}u.push(E)}for(let p=0;p<n;p++)for(let E=0;E<t;E++){const y=u[p][E+1],T=u[p][E],D=u[p+1][E],R=u[p+1][E+1];(p!==0||o>0)&&f.push(y,T,R),(p!==n-1||l<Math.PI)&&f.push(T,D,R)}this.setIndex(f),this.setAttribute("position",new We(g,3)),this.setAttribute("normal",new We(v,3)),this.setAttribute("uv",new We(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new un(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class so extends Ke{constructor(e=new ou(new C(-1,-1,0),new C(-1,1,0),new C(1,1,0)),t=64,n=1,s=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:s,closed:r};const o=e.computeFrenetFrames(t,r);this.tangents=o.tangents,this.normals=o.normals,this.binormals=o.binormals;const a=new C,l=new C,c=new ie;let u=new C;const h=[],d=[],f=[],g=[];v(),this.setIndex(g),this.setAttribute("position",new We(h,3)),this.setAttribute("normal",new We(d,3)),this.setAttribute("uv",new We(f,2));function v(){for(let y=0;y<t;y++)m(y);m(r===!1?t:0),E(),p()}function m(y){u=e.getPointAt(y/t,u);const T=o.normals[y],D=o.binormals[y];for(let R=0;R<=s;R++){const w=R/s*Math.PI*2,U=Math.sin(w),b=-Math.cos(w);l.x=b*T.x+U*D.x,l.y=b*T.y+U*D.y,l.z=b*T.z+U*D.z,l.normalize(),d.push(l.x,l.y,l.z),a.x=u.x+n*l.x,a.y=u.y+n*l.y,a.z=u.z+n*l.z,h.push(a.x,a.y,a.z)}}function p(){for(let y=1;y<=t;y++)for(let T=1;T<=s;T++){const D=(s+1)*(y-1)+(T-1),R=(s+1)*y+(T-1),w=(s+1)*y+T,U=(s+1)*(y-1)+T;g.push(D,R,U),g.push(R,w,U)}}function E(){for(let y=0;y<=t;y++)for(let T=0;T<=s;T++)c.x=y/t,c.y=T/s,f.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new so(new h_[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}}class d_ extends Ct{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class vt extends pi{constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new Ee(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ee(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=kc,this.normalScale=new ie(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new mn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class ro extends dt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ee(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),t}}class f_ extends ro{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(dt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ee(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}}const xa=new et,Ql=new C,ec=new C;class lu{constructor(e){this.camera=e,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ie(512,512),this.map=null,this.mapPass=null,this.matrix=new et,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new eo,this._frameExtents=new ie(1,1),this._viewportCount=1,this._viewports=[new rt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;Ql.setFromMatrixPosition(e.matrixWorld),t.position.copy(Ql),ec.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(ec),t.updateMatrixWorld(),xa.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(xa),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(xa)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const tc=new et,ls=new C,ya=new C;class p_ extends lu{constructor(){super(new Jt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new ie(4,2),this._viewportCount=6,this._viewports=[new rt(2,1,1,1),new rt(0,1,1,1),new rt(3,1,1,1),new rt(1,1,1,1),new rt(3,0,1,1),new rt(1,0,1,1)],this._cubeDirections=[new C(1,0,0),new C(-1,0,0),new C(0,0,1),new C(0,0,-1),new C(0,1,0),new C(0,-1,0)],this._cubeUps=[new C(0,1,0),new C(0,1,0),new C(0,1,0),new C(0,1,0),new C(0,0,1),new C(0,0,-1)]}updateMatrices(e,t=0){const n=this.camera,s=this.matrix,r=e.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),ls.setFromMatrixPosition(e.matrixWorld),n.position.copy(ls),ya.copy(n.position),ya.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(ya),n.updateMatrixWorld(),s.makeTranslation(-ls.x,-ls.y,-ls.z),tc.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(tc)}}class cu extends ro{constructor(e,t,n=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new p_}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class m_ extends lu{constructor(){super(new Tr(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Ma extends ro{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(dt.DEFAULT_UP),this.updateMatrix(),this.target=new dt,this.shadow=new m_}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class uu{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=nc(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const t=nc();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}}function nc(){return(typeof performance>"u"?Date:performance).now()}const ic=new et;class g_{constructor(e,t,n=0,s=1/0){this.ray=new Ts(e,t),this.near=n,this.far=s,this.camera=null,this.layers=new Qa,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return ic.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(ic),this}intersectObject(e,t=!0,n=[]){return ka(e,this,n,t),n.sort(sc),n}intersectObjects(e,t=!0,n=[]){for(let s=0,r=e.length;s<r;s++)ka(e[s],this,n,t);return n.sort(sc),n}}function sc(i,e){return i.distance-e.distance}function ka(i,e,t,n){let s=!0;if(i.layers.test(e.layers)&&i.raycast(e,t)===!1&&(s=!1),s===!0&&n===!0){const r=i.children;for(let o=0,a=r.length;o<a;o++)ka(r[o],e,t,!0)}}class rc{constructor(e=1,t=0,n=0){return this.radius=e,this.phi=t,this.theta=n,this}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=Math.max(1e-6,Math.min(Math.PI-1e-6,this.phi)),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos(At(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Ka}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Ka);const ac={type:"change"},Sa={type:"start"},oc={type:"end"},rr=new Ts,lc=new Fn,__=Math.cos(70*Fd.DEG2RAD);class v_ extends hi{constructor(e,t){super(),this.object=e,this.domElement=t,this.domElement.style.touchAction="none",this.enabled=!0,this.target=new C,this.cursor=new C,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:mi.ROTATE,MIDDLE:mi.DOLLY,RIGHT:mi.PAN},this.touches={ONE:gi.ROTATE,TWO:gi.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this.getPolarAngle=function(){return a.phi},this.getAzimuthalAngle=function(){return a.theta},this.getDistance=function(){return this.object.position.distanceTo(this.target)},this.listenToKeyEvents=function(_){_.addEventListener("keydown",se),this._domElementKeyEvents=_},this.stopListenToKeyEvents=function(){this._domElementKeyEvents.removeEventListener("keydown",se),this._domElementKeyEvents=null},this.saveState=function(){n.target0.copy(n.target),n.position0.copy(n.object.position),n.zoom0=n.object.zoom},this.reset=function(){n.target.copy(n.target0),n.object.position.copy(n.position0),n.object.zoom=n.zoom0,n.object.updateProjectionMatrix(),n.dispatchEvent(ac),n.update(),r=s.NONE},this.update=function(){const _=new C,G=new ci().setFromUnitVectors(e.up,new C(0,1,0)),O=G.clone().invert(),V=new C,Z=new ci,ve=new C,Ce=2*Math.PI;return function(pt=null){const qe=n.object.position;_.copy(qe).sub(n.target),_.applyQuaternion(G),a.setFromVector3(_),n.autoRotate&&r===s.NONE&&k(M(pt)),n.enableDamping?(a.theta+=l.theta*n.dampingFactor,a.phi+=l.phi*n.dampingFactor):(a.theta+=l.theta,a.phi+=l.phi);let mt=n.minAzimuthAngle,gt=n.maxAzimuthAngle;isFinite(mt)&&isFinite(gt)&&(mt<-Math.PI?mt+=Ce:mt>Math.PI&&(mt-=Ce),gt<-Math.PI?gt+=Ce:gt>Math.PI&&(gt-=Ce),mt<=gt?a.theta=Math.max(mt,Math.min(gt,a.theta)):a.theta=a.theta>(mt+gt)/2?Math.max(mt,a.theta):Math.min(gt,a.theta)),a.phi=Math.max(n.minPolarAngle,Math.min(n.maxPolarAngle,a.phi)),a.makeSafe(),n.enableDamping===!0?n.target.addScaledVector(u,n.dampingFactor):n.target.add(u),n.target.sub(n.cursor),n.target.clampLength(n.minTargetRadius,n.maxTargetRadius),n.target.add(n.cursor);let zt=!1;if(n.zoomToCursor&&R||n.object.isOrthographicCamera)a.radius=he(a.radius);else{const kt=a.radius;a.radius=he(a.radius*c),zt=kt!=a.radius}if(_.setFromSpherical(a),_.applyQuaternion(O),qe.copy(n.target).add(_),n.object.lookAt(n.target),n.enableDamping===!0?(l.theta*=1-n.dampingFactor,l.phi*=1-n.dampingFactor,u.multiplyScalar(1-n.dampingFactor)):(l.set(0,0,0),u.set(0,0,0)),n.zoomToCursor&&R){let kt=null;if(n.object.isPerspectiveCamera){const Rn=_.length();kt=he(Rn*c);const Xn=Rn-kt;n.object.position.addScaledVector(T,Xn),n.object.updateMatrixWorld(),zt=!!Xn}else if(n.object.isOrthographicCamera){const Rn=new C(D.x,D.y,0);Rn.unproject(n.object);const Xn=n.object.zoom;n.object.zoom=Math.max(n.minZoom,Math.min(n.maxZoom,n.object.zoom/c)),n.object.updateProjectionMatrix(),zt=Xn!==n.object.zoom;const $n=new C(D.x,D.y,0);$n.unproject(n.object),n.object.position.sub($n).add(Rn),n.object.updateMatrixWorld(),kt=_.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),n.zoomToCursor=!1;kt!==null&&(this.screenSpacePanning?n.target.set(0,0,-1).transformDirection(n.object.matrix).multiplyScalar(kt).add(n.object.position):(rr.origin.copy(n.object.position),rr.direction.set(0,0,-1).transformDirection(n.object.matrix),Math.abs(n.object.up.dot(rr.direction))<__?e.lookAt(n.target):(lc.setFromNormalAndCoplanarPoint(n.object.up,n.target),rr.intersectPlane(lc,n.target))))}else if(n.object.isOrthographicCamera){const kt=n.object.zoom;n.object.zoom=Math.max(n.minZoom,Math.min(n.maxZoom,n.object.zoom/c)),kt!==n.object.zoom&&(n.object.updateProjectionMatrix(),zt=!0)}return c=1,R=!1,zt||V.distanceToSquared(n.object.position)>o||8*(1-Z.dot(n.object.quaternion))>o||ve.distanceToSquared(n.target)>o?(n.dispatchEvent(ac),V.copy(n.object.position),Z.copy(n.object.quaternion),ve.copy(n.target),!0):!1}}(),this.dispose=function(){n.domElement.removeEventListener("contextmenu",me),n.domElement.removeEventListener("pointerdown",at),n.domElement.removeEventListener("pointercancel",x),n.domElement.removeEventListener("wheel",J),n.domElement.removeEventListener("pointermove",A),n.domElement.removeEventListener("pointerup",x),n.domElement.getRootNode().removeEventListener("keydown",_e,{capture:!0}),n._domElementKeyEvents!==null&&(n._domElementKeyEvents.removeEventListener("keydown",se),n._domElementKeyEvents=null)};const n=this,s={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6};let r=s.NONE;const o=1e-6,a=new rc,l=new rc;let c=1;const u=new C,h=new ie,d=new ie,f=new ie,g=new ie,v=new ie,m=new ie,p=new ie,E=new ie,y=new ie,T=new C,D=new ie;let R=!1;const w=[],U={};let b=!1;function M(_){return _!==null?2*Math.PI/60*n.autoRotateSpeed*_:2*Math.PI/60/60*n.autoRotateSpeed}function P(_){const G=Math.abs(_*.01);return Math.pow(.95,n.zoomSpeed*G)}function k(_){l.theta-=_}function B(_){l.phi-=_}const $=function(){const _=new C;return function(O,V){_.setFromMatrixColumn(V,0),_.multiplyScalar(-O),u.add(_)}}(),Y=function(){const _=new C;return function(O,V){n.screenSpacePanning===!0?_.setFromMatrixColumn(V,1):(_.setFromMatrixColumn(V,0),_.crossVectors(n.object.up,_)),_.multiplyScalar(O),u.add(_)}}(),W=function(){const _=new C;return function(O,V){const Z=n.domElement;if(n.object.isPerspectiveCamera){const ve=n.object.position;_.copy(ve).sub(n.target);let Ce=_.length();Ce*=Math.tan(n.object.fov/2*Math.PI/180),$(2*O*Ce/Z.clientHeight,n.object.matrix),Y(2*V*Ce/Z.clientHeight,n.object.matrix)}else n.object.isOrthographicCamera?($(O*(n.object.right-n.object.left)/n.object.zoom/Z.clientWidth,n.object.matrix),Y(V*(n.object.top-n.object.bottom)/n.object.zoom/Z.clientHeight,n.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),n.enablePan=!1)}}();function j(_){n.object.isPerspectiveCamera||n.object.isOrthographicCamera?c/=_:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),n.enableZoom=!1)}function X(_){n.object.isPerspectiveCamera||n.object.isOrthographicCamera?c*=_:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),n.enableZoom=!1)}function ue(_,G){if(!n.zoomToCursor)return;R=!0;const O=n.domElement.getBoundingClientRect(),V=_-O.left,Z=G-O.top,ve=O.width,Ce=O.height;D.x=V/ve*2-1,D.y=-(Z/Ce)*2+1,T.set(D.x,D.y,1).unproject(n.object).sub(n.object.position).normalize()}function he(_){return Math.max(n.minDistance,Math.min(n.maxDistance,_))}function pe(_){h.set(_.clientX,_.clientY)}function He(_){ue(_.clientX,_.clientX),p.set(_.clientX,_.clientY)}function $e(_){g.set(_.clientX,_.clientY)}function q(_){d.set(_.clientX,_.clientY),f.subVectors(d,h).multiplyScalar(n.rotateSpeed);const G=n.domElement;k(2*Math.PI*f.x/G.clientHeight),B(2*Math.PI*f.y/G.clientHeight),h.copy(d),n.update()}function ee(_){E.set(_.clientX,_.clientY),y.subVectors(E,p),y.y>0?j(P(y.y)):y.y<0&&X(P(y.y)),p.copy(E),n.update()}function de(_){v.set(_.clientX,_.clientY),m.subVectors(v,g).multiplyScalar(n.panSpeed),W(m.x,m.y),g.copy(v),n.update()}function oe(_){ue(_.clientX,_.clientY),_.deltaY<0?X(P(_.deltaY)):_.deltaY>0&&j(P(_.deltaY)),n.update()}function Oe(_){let G=!1;switch(_.code){case n.keys.UP:_.ctrlKey||_.metaKey||_.shiftKey?B(2*Math.PI*n.rotateSpeed/n.domElement.clientHeight):W(0,n.keyPanSpeed),G=!0;break;case n.keys.BOTTOM:_.ctrlKey||_.metaKey||_.shiftKey?B(-2*Math.PI*n.rotateSpeed/n.domElement.clientHeight):W(0,-n.keyPanSpeed),G=!0;break;case n.keys.LEFT:_.ctrlKey||_.metaKey||_.shiftKey?k(2*Math.PI*n.rotateSpeed/n.domElement.clientHeight):W(n.keyPanSpeed,0),G=!0;break;case n.keys.RIGHT:_.ctrlKey||_.metaKey||_.shiftKey?k(-2*Math.PI*n.rotateSpeed/n.domElement.clientHeight):W(-n.keyPanSpeed,0),G=!0;break}G&&(_.preventDefault(),n.update())}function Re(_){if(w.length===1)h.set(_.pageX,_.pageY);else{const G=Ie(_),O=.5*(_.pageX+G.x),V=.5*(_.pageY+G.y);h.set(O,V)}}function Ge(_){if(w.length===1)g.set(_.pageX,_.pageY);else{const G=Ie(_),O=.5*(_.pageX+G.x),V=.5*(_.pageY+G.y);g.set(O,V)}}function L(_){const G=Ie(_),O=_.pageX-G.x,V=_.pageY-G.y,Z=Math.sqrt(O*O+V*V);p.set(0,Z)}function Ve(_){n.enableZoom&&L(_),n.enablePan&&Ge(_)}function ke(_){n.enableZoom&&L(_),n.enableRotate&&Re(_)}function it(_){if(w.length==1)d.set(_.pageX,_.pageY);else{const O=Ie(_),V=.5*(_.pageX+O.x),Z=.5*(_.pageY+O.y);d.set(V,Z)}f.subVectors(d,h).multiplyScalar(n.rotateSpeed);const G=n.domElement;k(2*Math.PI*f.x/G.clientHeight),B(2*Math.PI*f.y/G.clientHeight),h.copy(d)}function Me(_){if(w.length===1)v.set(_.pageX,_.pageY);else{const G=Ie(_),O=.5*(_.pageX+G.x),V=.5*(_.pageY+G.y);v.set(O,V)}m.subVectors(v,g).multiplyScalar(n.panSpeed),W(m.x,m.y),g.copy(v)}function Xe(_){const G=Ie(_),O=_.pageX-G.x,V=_.pageY-G.y,Z=Math.sqrt(O*O+V*V);E.set(0,Z),y.set(0,Math.pow(E.y/p.y,n.zoomSpeed)),j(y.y),p.copy(E);const ve=(_.pageX+G.x)*.5,Ce=(_.pageY+G.y)*.5;ue(ve,Ce)}function Fe(_){n.enableZoom&&Xe(_),n.enablePan&&Me(_)}function Pe(_){n.enableZoom&&Xe(_),n.enableRotate&&it(_)}function at(_){n.enabled!==!1&&(w.length===0&&(n.domElement.setPointerCapture(_.pointerId),n.domElement.addEventListener("pointermove",A),n.domElement.addEventListener("pointerup",x)),!le(_)&&(ze(_),_.pointerType==="touch"?Le(_):H(_)))}function A(_){n.enabled!==!1&&(_.pointerType==="touch"?te(_):K(_))}function x(_){switch(Te(_),w.length){case 0:n.domElement.releasePointerCapture(_.pointerId),n.domElement.removeEventListener("pointermove",A),n.domElement.removeEventListener("pointerup",x),n.dispatchEvent(oc),r=s.NONE;break;case 1:const G=w[0],O=U[G];Le({pointerId:G,pageX:O.x,pageY:O.y});break}}function H(_){let G;switch(_.button){case 0:G=n.mouseButtons.LEFT;break;case 1:G=n.mouseButtons.MIDDLE;break;case 2:G=n.mouseButtons.RIGHT;break;default:G=-1}switch(G){case mi.DOLLY:if(n.enableZoom===!1)return;He(_),r=s.DOLLY;break;case mi.ROTATE:if(_.ctrlKey||_.metaKey||_.shiftKey){if(n.enablePan===!1)return;$e(_),r=s.PAN}else{if(n.enableRotate===!1)return;pe(_),r=s.ROTATE}break;case mi.PAN:if(_.ctrlKey||_.metaKey||_.shiftKey){if(n.enableRotate===!1)return;pe(_),r=s.ROTATE}else{if(n.enablePan===!1)return;$e(_),r=s.PAN}break;default:r=s.NONE}r!==s.NONE&&n.dispatchEvent(Sa)}function K(_){switch(r){case s.ROTATE:if(n.enableRotate===!1)return;q(_);break;case s.DOLLY:if(n.enableZoom===!1)return;ee(_);break;case s.PAN:if(n.enablePan===!1)return;de(_);break}}function J(_){n.enabled===!1||n.enableZoom===!1||r!==s.NONE||(_.preventDefault(),n.dispatchEvent(Sa),oe(Q(_)),n.dispatchEvent(oc))}function Q(_){const G=_.deltaMode,O={clientX:_.clientX,clientY:_.clientY,deltaY:_.deltaY};switch(G){case 1:O.deltaY*=16;break;case 2:O.deltaY*=100;break}return _.ctrlKey&&!b&&(O.deltaY*=10),O}function _e(_){_.key==="Control"&&(b=!0,n.domElement.getRootNode().addEventListener("keyup",re,{passive:!0,capture:!0}))}function re(_){_.key==="Control"&&(b=!1,n.domElement.getRootNode().removeEventListener("keyup",re,{passive:!0,capture:!0}))}function se(_){n.enabled===!1||n.enablePan===!1||Oe(_)}function Le(_){switch(De(_),w.length){case 1:switch(n.touches.ONE){case gi.ROTATE:if(n.enableRotate===!1)return;Re(_),r=s.TOUCH_ROTATE;break;case gi.PAN:if(n.enablePan===!1)return;Ge(_),r=s.TOUCH_PAN;break;default:r=s.NONE}break;case 2:switch(n.touches.TWO){case gi.DOLLY_PAN:if(n.enableZoom===!1&&n.enablePan===!1)return;Ve(_),r=s.TOUCH_DOLLY_PAN;break;case gi.DOLLY_ROTATE:if(n.enableZoom===!1&&n.enableRotate===!1)return;ke(_),r=s.TOUCH_DOLLY_ROTATE;break;default:r=s.NONE}break;default:r=s.NONE}r!==s.NONE&&n.dispatchEvent(Sa)}function te(_){switch(De(_),r){case s.TOUCH_ROTATE:if(n.enableRotate===!1)return;it(_),n.update();break;case s.TOUCH_PAN:if(n.enablePan===!1)return;Me(_),n.update();break;case s.TOUCH_DOLLY_PAN:if(n.enableZoom===!1&&n.enablePan===!1)return;Fe(_),n.update();break;case s.TOUCH_DOLLY_ROTATE:if(n.enableZoom===!1&&n.enableRotate===!1)return;Pe(_),n.update();break;default:r=s.NONE}}function me(_){n.enabled!==!1&&_.preventDefault()}function ze(_){w.push(_.pointerId)}function Te(_){delete U[_.pointerId];for(let G=0;G<w.length;G++)if(w[G]==_.pointerId){w.splice(G,1);return}}function le(_){for(let G=0;G<w.length;G++)if(w[G]==_.pointerId)return!0;return!1}function De(_){let G=U[_.pointerId];G===void 0&&(G=new ie,U[_.pointerId]=G),G.set(_.pageX,_.pageY)}function Ie(_){const G=_.pointerId===w[0]?w[1]:w[0];return U[G]}n.domElement.addEventListener("contextmenu",me),n.domElement.addEventListener("pointerdown",at),n.domElement.addEventListener("pointercancel",x),n.domElement.addEventListener("wheel",J,{passive:!1}),n.domElement.getRootNode().addEventListener("keydown",_e,{passive:!0,capture:!0}),this.update()}}const x_={harbor:[-6.2,-2.6],core:[0,-1.2],riverbend:[3.1,4.4],industry:[-4.2,4],garden:[6.2,-2.6],hillside:[1.4,-7.9]};function cc(i){return i.archetype==="downtown"?5467495:i.archetype==="industrial"?5857625:i.archetype==="residential"?6197097:i.archetype==="upland"?4684356:i.archetype==="river"?5603203:6651759}function Ha(i){return i.archetype==="downtown"?42:i.archetype==="industrial"?14:i.archetype==="residential"?20:i.archetype==="upland"?7:i.archetype==="river"?18:20}function uc(i,e,t){const n=Ha(i),s=i.archetype==="downtown"?7:i.archetype==="industrial"?4:i.archetype==="upland"?3:5,r=Math.ceil(n/s),o=i.archetype==="industrial"?1.28:i.archetype==="upland"?1.35:.86,a=t%s,l=Math.floor(t/s),c=(Be(e*41+t*3)-.5)*(i.archetype==="downtown"?.14:.24),u=(Be(e*61+t*7)-.5)*(i.archetype==="upland"?.38:.18),h=-((s-1)*o)/2+a*o+c,d=-((r-1)*o)/2+l*o+u,f=y_(i,t),g=(Be(e*70+t)-.5)*(i.archetype==="residential"?.34:.16),v=i.archetype==="upland"?Ga(h,d,e)+.08:.18;return i.archetype==="industrial"?{x:h,z:d,baseY:v,height:f,scaleX:1.12+Be(e*17+t)*.58,scaleZ:.74+Be(e*23+t)*.62,rotationY:g}:i.archetype==="residential"?{x:h,z:d,baseY:v,height:f,scaleX:.92+Be(e*13+t)*.2,scaleZ:.54+Be(e*29+t)*.22,rotationY:g}:i.archetype==="upland"?{x:h,z:d,baseY:v,height:f,scaleX:.55+Be(e*19+t)*.18,scaleZ:.5+Be(e*31+t)*.18,rotationY:g}:{x:h,z:d,baseY:v,height:f,scaleX:i.archetype==="downtown"?.68+Be(e*13+t)*.2:.72,scaleZ:i.archetype==="downtown"?.68+Be(e*17+t)*.2:.68,rotationY:g}}function y_(i,e){const t=i.imperviousness,n=Be((e+1)*17);return i.archetype==="downtown"?nt(2.3+t*4.1+n*4.4,2.2,9.4):i.archetype==="industrial"?nt(.7+t*.85+n*.9,.85,2.3):i.archetype==="residential"?nt(.95+t*1.1+n*1.1,1,3.1):i.archetype==="upland"?nt(.42+t*.55+n*.45,.45,1.15):i.archetype==="river"?nt(.9+t*1.7+n*1.4,.9,4):nt(1+t*1.8+n*1.6,1,4.4)}function Ga(i,e,t=0){const n=Math.max(0,(2.6-e)/5.2),s=Math.sin((i+t)*1.7)*.12+Math.cos((e-t)*1.3)*.1;return .12+n*1.25+s}function Be(i){const e=Math.sin(i*12.9898)*43758.5453;return e-Math.floor(e)}function M_(i,e,t){const n=nt(t,0,1),s=new Ee(i);return s.lerp(new Ee(e),n),s.getHex()}function ba(i){return i==="heat"?{background:4860449,fog:10968888,fogDensity:.024,skyTop:12087107,skyBottom:3692125,skyAccent:16747082,waterGlow:3520980,particle:16747082,street:16760938,windowGlow:16765066}:i==="rain"?{background:1521739,fog:3632518,fogDensity:.032,skyTop:4946064,skyBottom:1521739,skyAccent:6018815,waterGlow:6543615,particle:8119039,street:7526911,windowGlow:13235455}:i==="air"?{background:5065010,fog:10783570,fogDensity:.039,skyTop:10324834,skyBottom:3753787,skyAccent:13938779,waterGlow:5220020,particle:13938779,street:13090936,windowGlow:16768906}:i==="energy"?{background:3815204,fog:9141053,fogDensity:.024,skyTop:9073984,skyBottom:2506564,skyAccent:16769146,waterGlow:6806472,particle:16769146,street:16771480,windowGlow:16773286}:{background:1522501,fog:4094063,fogDensity:.025,skyTop:7316389,skyBottom:1522501,skyAccent:9764816,waterGlow:6018815,particle:9764816,street:9437138,windowGlow:14548969}}function S_(i){return i==="rain"?{size:.033,opacity:.4}:i==="heat"?{size:.052,opacity:.34}:i==="air"?{size:.058,opacity:.27}:i==="energy"?{size:.045,opacity:.42}:{size:.038,opacity:.22}}function b_(i){return i==="cooling"||i==="biodiversity"?8191886:i==="flood"?6871551:i==="energy"?16770689:i==="mobility"?8251391:i==="health"?16752560:i==="industry"?12177872:12429055}function E_(i){return i==="rain"?new C(1.8,.2,3.6):i==="heat"?new C(0,.25,-1.2):i==="air"?new C(-4.2,.45,4):i==="energy"?new C(0,2.2,-1.2):new C(0,.6,-1.2)}function T_(i,e){const t={core:[-2,1.85],harbor:[1.3,1.45],riverbend:[-1.65,-1.35],industry:[1.5,-1.25],garden:[-1.4,1.55],hillside:[-1.25,-.75]},[n,s]=t[i]??[0,0];return new C(e.x+n,e.y,e.z+s)}function w_(i){return i?`${i.year}:${i.turn}:${i.policyId}:${i.targetDistrictId??"city"}`:""}function A_(i){return i.lastResolution?`${i.lastResolution.year}:${i.lastResolution.title}:${i.lastResolution.soundCue}`:""}function cn(i,e,t){const n=e*3,s=Math.random()*Math.PI*2,r=t==="mobility"||t==="biodiversity"||t==="governance",o=Math.sqrt(Math.random())*(r?3.4:2.2);i[n]=Math.cos(s)*o,i[n+2]=Math.sin(s)*o,t==="flood"||t==="mobility"||t==="biodiversity"?i[n+1]=.08+Math.random()*.3:t==="energy"?i[n+1]=1.2+Math.random()*1.9:t==="cooling"?i[n+1]=1+Math.random()*1.9:i[n+1]=.18+Math.random()*.7}function Ni(i,e,t){const n=e*3;if(t==="rain"){i[n]=(Math.random()-.5)*13,i[n+1]=3+Math.random()*6.5,i[n+2]=(Math.random()-.5)*7.5;return}if(t==="heat"){i[n]=(Math.random()-.5)*7,i[n+1]=.2+Math.random()*1,i[n+2]=(Math.random()-.5)*5.4;return}if(t==="air"){i[n]=-7+Math.random()*1.6,i[n+1]=.6+Math.random()*3.6,i[n+2]=(Math.random()-.5)*6.4;return}if(t==="energy"){const s=Math.random()*Math.PI*2,r=.6+Math.random()*3.4;i[n]=Math.cos(s)*r,i[n+1]=.6+Math.random()*4.8,i[n+2]=Math.sin(s)*r;return}i[n]=(Math.random()-.5)*7.5,i[n+1]=.5+Math.random()*3,i[n+2]=(Math.random()-.5)*6}function Ea(i,e,t,n){const s=e*3;i[s]=(Math.random()-.5)*22,i[s+1]=n??(t==="rain"?3.2+Math.random()*4.2:.45+Math.random()*4.8),i[s+2]=(Math.random()-.5)*18}function C_(){const i=document.createElement("canvas");i.width=512,i.height=512;const e=i.getContext("2d");if(!e)return new Zl(i);const t=e.createLinearGradient(0,0,512,512);t.addColorStop(0,"#173034"),t.addColorStop(.52,"#10282d"),t.addColorStop(1,"#0b1d23"),e.fillStyle=t,e.fillRect(0,0,512,512),e.globalAlpha=.18,e.strokeStyle="#7be2d4",e.lineWidth=3;for(let s=42;s<512;s+=74)e.beginPath(),e.moveTo(s,0),e.lineTo(s+36,512),e.stroke(),e.beginPath(),e.moveTo(0,s),e.lineTo(512,s+18),e.stroke();e.globalAlpha=.12,e.strokeStyle="#f5d57a",e.lineWidth=1;for(let s=18;s<512;s+=38)e.beginPath(),e.moveTo(s,0),e.lineTo(s,512),e.stroke();e.globalAlpha=.08,e.fillStyle="#d7fff2";for(let s=0;s<320;s+=1){const r=Be(s*23)*512,o=Be(s*41)*512;e.fillRect(r,o,1.2,1.2)}const n=new Zl(i);return n.colorSpace=Kt,n.wrapS=xs,n.wrapT=xs,n.repeat.set(2,2),n.anisotropy=4,n}function R_(i,e){switch(e){case"heat":return nt(i.heatExposure/100,0,1);case"flood":return nt(i.floodExposure/100,0,1);case"air":return nt(i.airPollution/100,0,1);case"uhi":return nt(((i.uhiDeltaC??0)+7)/16,0,1);case"runoff":return nt((i.runoffCoefficient??0)/.95,0,1);default:return}}class P_{constructor(e,t){xe(this,"root",new ft);xe(this,"pickables",[]);xe(this,"scene");xe(this,"districtVisuals",new Map);xe(this,"waterMaterial");xe(this,"skyMaterial");xe(this,"hazeMaterial");xe(this,"haze");xe(this,"eventParticleMaterial");xe(this,"eventParticles");xe(this,"eventParticlePositions");xe(this,"eventLight");xe(this,"eventHalo");xe(this,"policyFx");xe(this,"policyScaffold");xe(this,"policyWorkers");xe(this,"policyWorkPad");xe(this,"hazardFx");xe(this,"hazardShockwave");xe(this,"hazardProps");xe(this,"policyCrane");xe(this,"policyCones");xe(this,"clockOffset",Math.random()*100);xe(this,"currentCue","civic");xe(this,"elapsedSeconds",0);xe(this,"eventPulse",0);xe(this,"policyFxStart",-100);xe(this,"hazardFxStart",-100);xe(this,"activePolicyCategory","governance");xe(this,"activeHazardCue","civic");xe(this,"policyShowConstruction",!0);xe(this,"seenPolicyKey","");xe(this,"seenResolutionKey","");xe(this,"seenChallengeId","");xe(this,"missionStarted",!1);xe(this,"dataLayerId","none");xe(this,"lastState");this.scene=e,this.root.name="ClimateResilienceCityWorld",e.add(this.root),this.skyMaterial=this.createSkyDome(),this.createTaipeiBasinBackdrop(),this.createTerrain(),this.waterMaterial=this.createWater(),this.createRiverCorridor();for(let c=0;c<t.districts.length;c+=1){const u=this.createDistrict(t.districts[c],c);this.districtVisuals.set(t.districts[c].id,u),this.root.add(u.root)}const{points:n,material:s}=this.createAtmosphere();this.haze=n,this.hazeMaterial=s,this.root.add(this.haze);const r=this.createEventParticles();this.eventParticles=r.points,this.eventParticleMaterial=r.material,this.eventParticlePositions=r.positions,this.root.add(this.eventParticles);const o=this.createEventFx();this.eventLight=o.light,this.eventHalo=o.halo,this.root.add(this.eventLight,this.eventHalo);const a=this.createPolicyFx();this.policyFx=a.fx,this.policyScaffold=a.scaffold,this.policyWorkers=a.workers,this.policyWorkPad=a.workPad,this.policyCrane=a.crane,this.policyCones=a.cones,this.root.add(this.policyFx.group);const l=this.createHazardFx();this.hazardFx=l.fx,this.hazardShockwave=l.shockwave,this.root.add(this.hazardFx.group),this.hazardProps=this.createHazardProps(),this.root.add(this.hazardProps.group),this.seenChallengeId=t.currentChallenge.id,this.seenPolicyKey=w_(t.appliedPolicies[0]),this.seenResolutionKey=A_(t),this.updateFromState(t)}setDataLayer(e){this.dataLayerId=e,this.lastState&&this.updateFromState(this.lastState)}updateFromState(e){this.lastState=e,this.currentCue=e.currentChallenge.soundCue;const t=ba(this.currentCue);this.scene.background instanceof Ee?this.scene.background.setHex(t.background):this.scene.background=new Ee(t.background),this.scene.fog instanceof Ar&&(this.scene.fog.color.setHex(t.fog),this.scene.fog.density=t.fogDensity+e.airQualityRisk/12e3),this.skyMaterial.uniforms.uSkyTop.value.setHex(t.skyTop),this.skyMaterial.uniforms.uSkyBottom.value.setHex(t.skyBottom),this.skyMaterial.uniforms.uAccent.value.setHex(t.skyAccent),this.waterMaterial.uniforms.uCueColor.value.setHex(t.waterGlow),this.waterMaterial.uniforms.uFlood.value=nt(e.floodRisk/100,0,1);for(const s of e.districts){const r=this.districtVisuals.get(s.id);if(!r)continue;const o=R_(s,this.dataLayerId);if(o!==void 0)r.base.material.color.setHSL(.62-o*.62,.78,.34+o*.14),r.base.material.emissive.setHSL(.62-o*.62,.7,.1),r.base.material.emissiveIntensity=.35+o*.4;else{const l=Math.max(s.heatExposure,s.floodExposure,s.airPollution),c=M_(cc(s),13134406,nt((l-42)/120,0,.38));r.base.material.color.setHex(c),r.base.material.emissive.setHex(s.heatExposure>70?3149832:463642),r.base.material.emissiveIntensity=s.heatExposure/160}r.buildingMaterial.color.setHSL(.56-s.airPollution/450,.42,.42),r.buildingMaterial.emissiveIntensity=s.solarCoverage*.18,r.windowMaterial.color.setHex(this.currentCue==="energy"?16773286:t.windowGlow),r.windowMaterial.opacity=nt(.16+s.solarCoverage*.32+e.energySecurity/420-s.airPollution/520,.12,.78),r.streetMaterial.color.setHex(s.transitAccess>.58?t.street:5141632),r.streetMaterial.opacity=nt(.2+s.transitAccess*.42,.22,.74);const a=this.dataLayerId==="none";r.cellTiles.forEach((l,c)=>{l.visible=a;const u=s.cells[c]??"pavement";l.material.color.setHex(wa[u].color)}),r.waterOverlay.visible=!1,r.heatDome.visible=!1,r.selectedOutline.visible=s.id===e.selectedDistrictId,r.selectedOutline.material.opacity=s.id===e.selectedDistrictId?.92:0,r.root.position.y=s.id===e.selectedDistrictId?.16:0}this.hazeMaterial.opacity=nt(e.airQualityRisk/330,.045,.28),this.hazeMaterial.size=e.currentChallenge.soundCue==="air"?.055:.035,this.hazeMaterial.color.setHex(t.particle);const n=S_(this.currentCue);this.eventParticleMaterial.color.setHex(t.particle),this.eventParticleMaterial.size=n.size,this.eventParticleMaterial.opacity=n.opacity,this.eventLight.color.setHex(t.particle),this.eventHalo.material.color.setHex(t.particle),this.eventHalo.visible=!1,e.lastResolution&&(this.eventPulse=1),e.mission.status==="active"&&!this.missionStarted&&(this.triggerHazardFx(e.currentChallenge.soundCue),this.missionStarted=!0)}playYearTransition(e){const t=e.appliedPolicies.filter(s=>s.turn===e.turn).slice().reverse();t.forEach((s,r)=>{window.setTimeout(()=>this.triggerPolicyFx(s,e),260+r*720)});const n=Math.max(1200,680+t.length*720);window.setTimeout(()=>this.triggerHazardFx(e.currentChallenge.soundCue),n)}tick(e){this.elapsedSeconds=e,this.skyMaterial.uniforms.uTime.value=e,this.waterMaterial.uniforms.uTime.value=e,this.haze.rotation.y=Math.sin((e+this.clockOffset)*.08)*.06,this.haze.position.y=2.2+Math.sin(e*.42)*.12,this.animateEventParticles(e),this.animatePolicyFx(e),this.animateHazardFx(e);const t=.5+Math.sin((e+this.clockOffset)*1.7)*.5;this.eventLight.intensity=.42+t*.18+this.eventPulse*2.1,this.eventHalo.material.opacity=.045+t*.028+this.eventPulse*.16,this.eventHalo.scale.setScalar(1+t*.05+this.eventPulse*.34),this.eventPulse=Math.max(0,this.eventPulse-.018)}findCellTarget(e){let t=e;for(;t;){if(typeof t.userData.cellIndex=="number"&&typeof t.userData.districtId=="string")return{districtId:t.userData.districtId,cellIndex:t.userData.cellIndex};t=t.parent}}findDistrictId(e){let t=e;for(;t;){if(typeof t.userData.districtId=="string")return t.userData.districtId;t=t.parent}}createTaipeiBasinBackdrop(){const e=new vt({color:3108695,roughness:.94,metalness:.02,emissive:464655,emissiveIntensity:.08}),t=new vt({color:1985602,roughness:.96,metalness:.01}),n=[[-10.2,-10.8,4.8,3.2],[-6.8,-12.1,6.2,4.5],[-2.3,-11.4,5.5,3.7],[2.6,-12.2,6.5,4.9],[7.2,-11.2,5.4,3.6],[10.6,-10.4,4.2,2.9]];for(const[a,l,c,u]of n){const h=new be(new fs(c,u,5),e);h.position.set(a,u/2-.35,l),h.scale.z=.55,h.rotation.y=Math.PI/5,h.castShadow=!0,h.receiveShadow=!0,this.root.add(h)}const s=new be(new En(18,20,.18,7),new vt({color:1784628,roughness:.9,metalness:.02,transparent:!0,opacity:.74}));s.position.set(0,-.36,-2.4),s.scale.set(1.2,1,.82),s.rotation.y=Math.PI/7,s.receiveShadow=!0,this.root.add(s);const r=new ln(new Ke().setAttribute("position",new We([-11.8,1.8,-10.2,-7.8,3.3,-11.6,-7.8,3.3,-11.6,-3.8,2.4,-10.8,-3.8,2.4,-10.8,1.4,3.8,-11.9,1.4,3.8,-11.9,6.2,2.6,-10.9,6.2,2.6,-10.9,11.7,1.7,-10.2],3)),new sn({color:9164452,transparent:!0,opacity:.26}));r.renderOrder=2,this.root.add(r);const o=new be(new xt(23,.22,3.8),t);o.position.set(0,-.22,-8.3),o.receiveShadow=!0,this.root.add(o)}createRiverCorridor(){const e=new vt({color:1477284,roughness:.24,metalness:.06,transparent:!0,opacity:.76,emissive:539979,emissiveIntensity:.18}),t=new au([new C(-10.4,.02,5.8),new C(-6.6,.03,4.6),new C(-2.1,.03,4.9),new C(2.2,.03,3.9),new C(7.8,.03,4.7),new C(11.5,.03,6.2)]),n=new be(new so(t,90,.34,12,!1),e);n.rotation.x=0,n.receiveShadow=!0,this.root.add(n);const s=new vt({color:11257789,roughness:.72,metalness:.16,emissive:1124901,emissiveIntensity:.08});for(const[r,o,a]of[[-5.2,4.7,-.28],[.8,4.4,-.16],[6,4.8,.22]]){const l=new be(new xt(1.9,.16,.34),s);l.position.set(r,.32,o),l.rotation.y=a,l.castShadow=!0,l.receiveShadow=!0,this.root.add(l)}}createSkyDome(){const e=new Ct({side:Dt,depthWrite:!1,uniforms:{uTime:{value:0},uSkyTop:{value:new Ee(1192522)},uSkyBottom:{value:new Ee(661536)},uAccent:{value:new Ee(6740479)}},vertexShader:`
        varying vec3 vDirection;

        void main() {
          vDirection = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        varying vec3 vDirection;
        uniform float uTime;
        uniform vec3 uSkyTop;
        uniform vec3 uSkyBottom;
        uniform vec3 uAccent;

        void main() {
          vec3 dir = normalize(vDirection);
          float horizon = smoothstep(-0.2, 0.72, dir.y);
          float ribbon = sin(dir.x * 8.0 + dir.z * 3.0 + uTime * 0.05) * 0.5 + 0.5;
          float glow = pow(max(0.0, 1.0 - abs(dir.y - 0.08) * 3.8), 2.0);
          vec3 sky = mix(uSkyBottom, uSkyTop, horizon);
          sky += uAccent * ribbon * glow * 0.13;
          gl_FragColor = vec4(sky, 1.0);
        }
      `}),t=new be(new un(44,64,32),e);return t.name="ProceduralClimateSky",t.renderOrder=-20,this.scene.add(t),e}createTerrain(){const e=new vt({color:2112311,map:C_(),roughness:.88,metalness:.04,emissive:266260,emissiveIntensity:.12}),t=new be(new xt(22.5,.25,18.8),e);t.position.set(0,-.26,-1.8),t.receiveShadow=!0,this.root.add(t)}createWater(){const e=new Ct({transparent:!0,depthWrite:!1,uniforms:{uTime:{value:0},uCueColor:{value:new Ee(6018815)},uFlood:{value:.5}},vertexShader:`
        varying vec2 vUv;
        uniform float uTime;

        void main() {
          vUv = uv;
          vec3 p = position;
          p.z += sin((p.x + uTime * 0.7) * 1.8) * 0.035;
          p.z += sin((p.y - uTime * 0.45) * 3.2) * 0.018;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,fragmentShader:`
        varying vec2 vUv;
        uniform float uTime;
        uniform vec3 uCueColor;
        uniform float uFlood;

        void main() {
          float wave = sin((vUv.x + uTime * 0.035) * 48.0) * 0.5 + 0.5;
          float ripple = sin((vUv.y - uTime * 0.05) * 34.0) * 0.5 + 0.5;
          float shore = smoothstep(0.0, 0.22, vUv.y) * (1.0 - smoothstep(0.78, 1.0, vUv.y));
          vec3 deep = vec3(0.015, 0.13, 0.18);
          vec3 surface = mix(deep, uCueColor, 0.34 + wave * 0.12 + ripple * 0.08);
          float foam = smoothstep(0.88, 1.0, wave * ripple) * shore;
          float alpha = mix(0.46, 0.82, uFlood) * shore;
          gl_FragColor = vec4(surface + foam * 0.28, alpha);
        }
      `}),t=new be(new li(23,8,96,28),e);return t.rotation.x=-Math.PI/2,t.position.set(0,-.08,7.4),t.receiveShadow=!0,this.root.add(t),e}createDistrict(e,t){const[n,s]=x_[e.id]??[t*4,0],r=new ft;r.position.set(n,0,s),r.userData.districtId=e.id;const o=new vt({color:cc(e),roughness:.78,metalness:.08,emissive:397332,emissiveIntensity:.08}),a=new be(new xt(5.2,.28,5.2),o);a.castShadow=!0,a.receiveShadow=!0,a.userData.districtId=e.id,r.add(a),this.pickables.push(a);const l=[],c=5.2/Yn;for(let E=0;E<Yn*Yn;E+=1){const y=E%Yn,T=Math.floor(E/Yn),D=new be(new li(c*.88,c*.88),new vt({color:wa[e.cells[E]??"pavement"].color,roughness:.85,metalness:.02,transparent:!0,opacity:.85}));D.rotation.x=-Math.PI/2,D.position.set((y-(Yn-1)/2)*c,.152,(T-(Yn-1)/2)*c),D.userData.districtId=e.id,D.userData.cellIndex=E,D.renderOrder=2,r.add(D),this.pickables.push(D),l.push(D)}if(e.archetype==="upland"){const E=this.createHillsideTerrain(t);E.userData.districtId=e.id,r.add(E)}const u=new vt({color:6000291,roughness:.53,metalness:.18,emissive:1457224,emissiveIntensity:.08}),h=this.createBuildingCluster(e,u,t);if(h.userData.districtId=e.id,r.add(h),this.pickables.push(h),e.id==="core"){const E=this.createTaipeiLandmark(u);E.userData.districtId=e.id,r.add(E),this.pickables.push(E)}const d=this.createWindowCluster(e,t);d.mesh.userData.districtId=e.id,r.add(d.mesh);const f=this.createStreetGrid(e,t);f.lines.userData.districtId=e.id,r.add(f.lines);const g=this.createCanopyCluster(e,t);g.userData.districtId=e.id,r.add(g);const v=new be(new io(3,48),new Wt({color:3653112,transparent:!0,opacity:.2,depthWrite:!1}));v.rotation.x=-Math.PI/2,v.position.y=.17,v.visible=!1,v.userData.districtId=e.id,r.add(v);const m=new be(new un(3.2,36,18),new Wt({color:16743229,transparent:!0,opacity:.08,depthWrite:!1,blending:Et}));m.scale.y=.28,m.position.y=1.4,m.visible=!1,m.userData.districtId=e.id,r.add(m);const p=new ln(new Ke().setAttribute("position",new We([-2.72,.24,-2.72,2.72,.24,-2.72,2.72,.24,-2.72,2.72,.24,2.72,2.72,.24,2.72,-2.72,.24,2.72,-2.72,.24,2.72,-2.72,.24,-2.72],3)),new sn({color:9437138,transparent:!0,opacity:.92}));return p.visible=!1,r.add(p),{root:r,base:a,cellTiles:l,buildingMaterial:u,windowMaterial:d.material,streetMaterial:f.material,waterOverlay:v,heatDome:m,selectedOutline:p}}createHillsideTerrain(e){const t=new ft,n=18,s=5.2,r=[],o=[];for(let h=0;h<=n;h+=1)for(let d=0;d<=n;d+=1){const f=-s/2+d/n*s,g=-s/2+h/n*s,v=Ga(f,g,e);r.push(f,v,g)}for(let h=0;h<n;h+=1)for(let d=0;d<n;d+=1){const f=h*(n+1)+d,g=f+1,v=f+n+1,m=v+1;o.push(f,v,g,g,v,m)}const a=new Ke;a.setAttribute("position",new We(r,3)),a.setIndex(o),a.computeVertexNormals();const l=new be(a,new vt({color:4164952,roughness:.9,metalness:.02,emissive:729876,emissiveIntensity:.06}));l.receiveShadow=!0,l.castShadow=!0,t.add(l);const c=[];for(let h=0;h<5;h+=1){const d=-2.05+h*.72,f=.4+h*.22;c.push(-2.15,f,d,2.15,f+.05,d+.12)}const u=new ln(new Ke().setAttribute("position",new We(c,3)),new sn({color:12050592,transparent:!0,opacity:.46}));return u.renderOrder=3,t.add(u),t}createTaipeiLandmark(e){const t=new ft,n=e.clone();n.color.setHex(7317664),n.emissive.setHex(2052429),n.emissiveIntensity=.16;for(let o=0;o<7;o+=1){const a=.92-o*.055,l=new be(new xt(a,.7,a),n);l.position.set(-.7,2.1+o*.72,-.4),l.castShadow=!0,l.receiveShadow=!0,t.add(l)}const s=new be(new xt(1.1,1.2,1.1),n);s.position.set(-.7,.82,-.4),s.castShadow=!0,s.receiveShadow=!0,t.add(s);const r=new be(new fs(.18,1.4,8),new vt({color:13107187,emissive:7340008,emissiveIntensity:.28,roughness:.36,metalness:.34}));return r.position.set(-.7,7.8,-.4),r.castShadow=!0,t.add(r),t}createBuildingCluster(e,t,n){const s=Ha(e),r=new pa(new xt(1,1,1),t,s);r.castShadow=!0,r.receiveShadow=!0;const o=new dt;for(let a=0;a<s;a+=1){const l=uc(e,n,a);o.position.set(l.x,l.baseY+l.height/2,l.z),o.scale.set(l.scaleX,l.height,l.scaleZ),o.rotation.y=l.rotationY,o.updateMatrix(),r.setMatrixAt(a,o.matrix)}return r.instanceMatrix.needsUpdate=!0,r}createWindowCluster(e,t){const n=Ha(e),s=e.archetype==="downtown"?12:e.archetype==="industrial"?4:6,r=new Wt({color:16770984,transparent:!0,opacity:.42,depthWrite:!1,blending:Et}),o=new pa(new xt(.12,.085,.014),r,n*s*2);o.frustumCulled=!1;const a=new dt;let l=0;for(let c=0;c<n;c+=1){const u=uc(e,t,c),h=Math.max(1,Math.min(s,Math.round(u.height*1.25)));for(let d=0;d<h;d+=1){const f=u.baseY+.2+u.height*(d+1)/(h+1),g=(Be(t*211+c*17+d)-.5)*.22;a.position.set(u.x+g,f,u.z+u.scaleZ*.51),a.rotation.set(0,u.rotationY,0),a.scale.setScalar(e.archetype==="industrial"?1.25:1),a.updateMatrix(),o.setMatrixAt(l,a.matrix),l+=1,a.position.set(u.x+u.scaleX*.51,f,u.z+g),a.rotation.set(0,u.rotationY+Math.PI/2,0),a.scale.setScalar(e.archetype==="industrial"?1.25:1),a.updateMatrix(),o.setMatrixAt(l,a.matrix),l+=1}}return o.count=l,o.instanceMatrix.needsUpdate=!0,{mesh:o,material:r}}createStreetGrid(e,t){const n=[],s=e.archetype==="downtown"?5:e.archetype==="upland"?3:4,r=2.5,o=.205;for(let u=0;u<s;u+=1){const h=u/(s-1),d=-r+h*r*2+(Be(t*81+u)-.5)*.16;n.push(-r,o,d,r,o,d),n.push(d,o,-r,d,o,r)}n.push(-r,o,-r,r,o,-r),n.push(r,o,-r,r,o,r),n.push(r,o,r,-r,o,r),n.push(-r,o,r,-r,o,-r);const a=new Ke;a.setAttribute("position",new We(n,3));const l=new sn({color:8775895,transparent:!0,opacity:.42,depthWrite:!1}),c=new ln(a,l);return c.renderOrder=3,{lines:c,material:l}}createCanopyCluster(e,t){const n=Math.max(4,Math.round(e.canopyCover*46)),s=new vt({color:5752709,roughness:.72,metalness:.03,emissive:732440,emissiveIntensity:.04}),r=new pa(new fs(.25,.72,7),s,n);r.castShadow=!0,r.receiveShadow=!0;const o=new dt;for(let a=0;a<n;a+=1){const l=Be(t*99+a)*Math.PI*2,c=1.2+Be(t*11+a)*1.5,u=Math.cos(l)*c,h=Math.sin(l)*c,d=e.archetype==="upland"?Ga(u,h,t)+.5:.62;o.position.set(u,d,h),o.scale.setScalar(.72+Be(t*42+a)*.5),o.rotation.y=l,o.updateMatrix(),r.setMatrixAt(a,o.matrix)}return r.instanceMatrix.needsUpdate=!0,r}createAtmosphere(){const t=new Float32Array(2700);for(let r=0;r<900;r+=1)t[r*3]=(Math.random()-.5)*24,t[r*3+1]=.8+Math.random()*4.2,t[r*3+2]=(Math.random()-.5)*20;const n=new Ke;n.setAttribute("position",new Lt(t,3));const s=new us({color:13934939,size:.035,transparent:!0,opacity:.12,depthWrite:!1,blending:Et});return{points:new ir(n,s),material:s}}createEventParticles(){const t=new Float32Array(2280);for(let o=0;o<760;o+=1)Ea(t,o,this.currentCue);const n=new Ke;n.setAttribute("position",new Lt(t,3));const s=new us({color:9437138,size:.04,transparent:!0,opacity:.22,depthWrite:!1,blending:Et}),r=new ir(n,s);return r.frustumCulled=!1,r.renderOrder=4,{points:r,material:s,positions:t}}animateEventParticles(e){const t=this.eventParticlePositions,n=t.length/3,s=this.currentCue;for(let o=0;o<n;o+=1){const a=o*3,l=Math.sin(e*.6+o*.37)*.006;s==="rain"?(t[a]+=l,t[a+1]-=.052+Be(o*19)*.034,t[a+2]+=.01,t[a+1]<.08&&Ea(t,o,s,6.8)):s==="heat"?(t[a]+=l*.8,t[a+1]+=.012+Be(o*13)*.012,t[a+2]+=Math.sin(e*.9+o)*.003,t[a+1]>5.8&&Ea(t,o,s,.32)):s==="air"?(t[a]+=.012+Be(o*7)*.012,t[a+1]+=Math.sin(e+o)*.002,t[a+2]+=l,t[a]>12&&(t[a]=-12,t[a+1]=.9+Math.random()*3.6,t[a+2]=(Math.random()-.5)*18)):s==="energy"?(t[a]+=Math.sin(e*2.4+o)*.006,t[a+1]+=Math.sin(e*3.2+o*.25)*.004,t[a+2]+=Math.cos(e*2.1+o)*.006):(t[a]+=l*.55,t[a+1]+=Math.sin(e*.72+o)*.002)}const r=this.eventParticles.geometry.getAttribute("position");r.needsUpdate=!0,this.eventParticles.rotation.y=Math.sin(e*.09)*.045}createPolicyFx(){const e=new ft;e.visible=!1;const t=340,n=new Float32Array(t*3);for(let d=0;d<t;d+=1)cn(n,d,"governance");const s=new Ke;s.setAttribute("position",new Lt(n,3));const r=new us({color:9437138,size:.085,transparent:!0,opacity:0,depthWrite:!1,blending:Et}),o=new ir(s,r);o.frustumCulled=!1,e.add(o);const a=new ln(new Ke().setAttribute("position",new We([-1.9,.25,-1.4,-1.9,2.4,-1.4,-1.9,2.4,-1.4,.9,2.4,-1.4,.9,2.4,-1.4,1.35,1.85,-1.4,-1.9,.95,-1.4,.9,2.4,-1.4,-1.9,1.62,-1.4,-.45,.25,-1.4,1.4,.25,1.35,1.4,1.55,1.35,.6,1.55,1.35,2,1.55,1.35,.6,1.55,1.35,1.4,.25,1.35,2,1.55,1.35,1.4,.25,1.35],3)),new sn({color:16766815,transparent:!0,opacity:0}));a.renderOrder=5,e.add(a);const l=new be(new li(3,2.15),new Wt({color:16766815,transparent:!0,opacity:0,depthWrite:!1,side:$t}));l.rotation.x=-Math.PI/2,l.position.y=.08,l.renderOrder=4,e.add(l);const c=this.createPolicyWorkers();e.add(c);const u=this.createPolicyCrane();e.add(u);const h=this.createTrafficCones();return e.add(h),{fx:{group:e,points:o,material:r,positions:n},scaffold:a,workers:c,workPad:l,crane:u,cones:h}}createPolicyCrane(){const e=new ft,t=new vt({color:16761405,roughness:.5,metalness:.35,emissive:3351306,emissiveIntensity:.18}),n=new be(new xt(.5,.12,.5),t);n.position.y=.06;const s=new be(new En(.055,.07,2.6,6),t);s.position.y=1.42,e.add(n,s);const r=new ft;r.position.y=2.74;const o=new be(new xt(1.95,.07,.07),t);o.position.x=.78;const a=new be(new xt(.6,.09,.09),t);a.position.x=-.42;const l=new be(new xt(.16,.2,.16),t);l.position.set(-.66,-.08,0);const c=new Ke().setAttribute("position",new We([0,.34,0,1.68,.02,0,0,.34,0,-.6,.02,0],3)),u=new ln(c,new sn({color:14211288,transparent:!0,opacity:.85})),h=new be(new En(.008,.008,1,4),t);h.position.set(1.55,-.5,0);const d=new be(new xt(.12,.12,.12),t);return d.position.set(1.55,-1.05,0),r.add(o,a,l,u,h,d),r.userData.cable=h,r.userData.hook=d,e.add(r),e.userData.jib=r,e.position.set(1.95,.1,-.7),e}createTrafficCones(){const e=new ft,t=new vt({color:16738858,roughness:.6,emissive:5576451,emissiveIntensity:.32}),n=new vt({color:15921906,roughness:.5,emissive:4210752,emissiveIntensity:.25});for(let s=0;s<8;s+=1){const r=new ft,o=new be(new En(.016,.085,.2,8),t);o.position.y=.1;const a=new be(new En(.045,.058,.035,8),n);a.position.y=.11,r.add(o,a);const l=s/8*Math.PI*2+.32,c=1.7+Be(s*23)*.5;r.position.set(Math.cos(l)*c,.02,Math.sin(l)*c),e.add(r)}return e}createPolicyWorkers(){const e=new ft,t=new vt({color:16766815,roughness:.62,metalness:.08,emissive:3809544,emissiveIntensity:.14}),n=new vt({color:16773258,roughness:.46,metalness:.1,emissive:4863238,emissiveIntensity:.16});for(let l=0;l<10;l+=1){const c=new ft,u=new be(new En(.085,.105,.34,8),t),h=new be(new un(.105,10,8),n);u.position.y=.2,h.position.y=.42,c.add(u,h);const d=l/10*Math.PI*2,f=.9+Be(l*31)*1.45;c.position.set(Math.cos(d)*f,.16,Math.sin(d)*f),c.rotation.y=-d,c.userData.phase=Be(l*19)*Math.PI*2,e.add(c)}const s=new vt({color:16758861,roughness:.54,metalness:.16,emissive:3808261,emissiveIntensity:.12}),r=new ft,o=new be(new xt(.62,.24,.32),s),a=new be(new xt(.3,.3,.32),s);return o.position.set(0,.22,0),a.position.set(.42,.26,0),r.add(o,a),r.position.set(-1.75,.18,1.55),r.userData.phase=0,e.add(r),e}createHazardFx(){const e=new ft;e.visible=!1;const t=680,n=new Float32Array(t*3);for(let l=0;l<t;l+=1)Ni(n,l,"civic");const s=new Ke;s.setAttribute("position",new Lt(n,3));const r=new us({color:16747082,size:.075,transparent:!0,opacity:0,depthWrite:!1,blending:Et}),o=new ir(s,r);o.frustumCulled=!1,o.renderOrder=6,e.add(o);const a=new be(new ps(.7,.96,96),new Wt({color:16747082,transparent:!0,opacity:0,depthWrite:!1,blending:Et,side:$t}));return a.rotation.x=-Math.PI/2,a.position.y=.24,a.renderOrder=7,e.add(a),{fx:{group:e,points:o,material:r,positions:n},shockwave:a}}triggerPolicyFx(e,t){var u;const n=$a(e.policyId),s=(n==null?void 0:n.category)??"governance",r=e.targetDistrictId??t.selectedDistrictId,o=((u=this.districtVisuals.get(r))==null?void 0:u.root.position)??new C(0,0,-1.2),a=T_(r,o),l=b_(s);this.activePolicyCategory=s,this.policyFx.group.visible=!0,this.policyFx.group.position.set(a.x,.12,a.z),this.policyFx.group.scale.setScalar((n==null?void 0:n.target)==="city"?1.55:1),this.policyFx.material.color.setHex(l);const c=s==="flood"||s==="energy"||s==="mobility"||s==="industry"||s==="governance";this.policyShowConstruction=c,this.policyScaffold.visible=c,this.policyWorkers.visible=c,this.policyScaffold.material.color.setHex(l),this.policyWorkPad.material.color.setHex(l),this.tintPolicyWorkers(l),this.policyFxStart=this.elapsedSeconds;for(let h=0;h<this.policyFx.positions.length/3;h+=1)cn(this.policyFx.positions,h,s);this.policyFx.points.geometry.getAttribute("position").needsUpdate=!0}createHazardProps(){const e=new ft;e.visible=!1;const t=new be(new un(1.25,24,18),new Wt({color:16742954,transparent:!0,opacity:0}));t.position.set(3.6,6.6,-3.4),t.renderOrder=8,e.add(t);const n=new be(new un(2,20,16),new Wt({color:16757322,transparent:!0,opacity:0,blending:Et,depthWrite:!1}));n.position.copy(t.position),e.add(n);const s=[];for(let E=0;E<12;E+=1){const y=E/12*Math.PI*2,T=1.45,D=2.3+Be(E*7)*.7;s.push(Math.cos(y)*T,Math.sin(y)*T,0),s.push(Math.cos(y)*D,Math.sin(y)*D,0)}const r=new ln(new Ke().setAttribute("position",new We(s,3)),new sn({color:16764778,transparent:!0,opacity:0,blending:Et}));r.position.copy(t.position),r.renderOrder=8,e.add(r);const o=new be(new ps(2.4,4.8,64),new Wt({color:16756848,transparent:!0,opacity:0,depthWrite:!1,blending:Et,side:$t}));o.rotation.x=-Math.PI/2,o.position.y=.32,o.renderOrder=7,e.add(o);const a=new ft,l=new vt({color:3752527,roughness:1,metalness:0,transparent:!0,opacity:0,emissive:10470655,emissiveIntensity:0});for(const[E,y,T]of[[-1,0,.95],[.1,.25,1.2],[1.1,-.1,.92],[.25,-.55,.82]]){const D=new be(new un(T,16,12),l);D.position.set(E,0,y),D.scale.y=.6,a.add(D)}a.position.set(0,5.6,-1),e.add(a);const c=new ln(this.makeBoltGeometry(),new sn({color:13954303,transparent:!0,opacity:0,blending:Et}));c.position.set(0,4.9,-1),c.renderOrder=8,e.add(c);const u=320,h=new Float32Array(u*6),d=new Float32Array(u);for(let E=0;E<u;E+=1)this.respawnRainStreak(h,d,E,!0);const f=new ln(new Ke().setAttribute("position",new Lt(h,3)),new sn({color:11982058,transparent:!0,opacity:0,blending:Et}));f.frustumCulled=!1,f.renderOrder=7,f.userData.positions=h,f.userData.speeds=d,e.add(f);const g=new ft;for(let E=0;E<14;E+=1){const y=new be(new ps(.05,.085,18),new Wt({color:13625077,transparent:!0,opacity:0,depthWrite:!1,blending:Et,side:$t}));y.rotation.x=-Math.PI/2,y.position.set((Be(E*13)-.5)*9,.1,(Be(E*29)-.5)*9),y.userData.phase=E/14,g.add(y)}g.renderOrder=7,e.add(g);const v=new ft,m=new vt({color:9207139,roughness:1,transparent:!0,opacity:0});[[-1.5,.2,0,1],[-.2,.7,.3,1.35],[1.2,.3,-.2,1.05],[.3,1.2,.1,.9]].forEach(([E,y,T,D],R)=>{const w=new be(new un(D,14,10),m);w.position.set(E,y,T),w.userData.base=new C(E,y,T),w.userData.phase=R*1.7,v.add(w)}),v.position.set(0,3.3,-1),e.add(v);const p=new ln(this.makeSparkGeometry(),new sn({color:16770689,transparent:!0,opacity:0,blending:Et}));return p.position.set(0,2.6,-1),p.renderOrder=8,e.add(p),{group:e,sun:t,corona:n,sunRays:r,mirage:o,cloud:a,bolt:c,rain:f,splashes:g,smog:v,spark:p}}respawnRainStreak(e,t,n,s=!1){const r=n*6,o=(Be(n*7+1)-.5)*13+(Math.random()-.5)*4,a=(Be(n*11+3)-.5)*13+(Math.random()-.5)*4,l=s?1+Math.random()*6:6+Math.random()*1.5,c=.32+Math.random()*.22,u=.07,h=.16;e[r]=o,e[r+1]=l,e[r+2]=a,e[r+3]=o-u*c*6,e[r+4]=l+c,e[r+5]=a-h*c*6,t[n]=.16+Math.random()*.1}makeBoltGeometry(){const e=[];let t=0,n=0;for(let s=1;s<=9;s+=1){const r=(Math.random()-.5)*1.3,o=-s*.4;e.push(t,n,0,r,o,0),t=r,n=o}return new Ke().setAttribute("position",new We(e,3))}makeSparkGeometry(){const e=[];for(let t=0;t<7;t+=1){const n=t/7*Math.PI*2;let s=0,r=0,o=0;for(let a=1;a<=4;a+=1){const l=a*.62,c=Math.cos(n)*l+(Math.random()-.5)*.34,u=Math.sin(n)*l+(Math.random()-.5)*.34,h=(Math.random()-.5)*.45;e.push(s,r,o,c,h,u),s=c,r=h,o=u}}return new Ke().setAttribute("position",new We(e,3))}updateHazardProps(e,t,n){const s=this.hazardProps;if(s.group.visible=!0,s.sun.visible=s.corona.visible=s.sunRays.visible=s.mirage.visible=e==="heat",s.cloud.visible=s.bolt.visible=s.rain.visible=s.splashes.visible=e==="rain",s.smog.visible=e==="air",s.spark.visible=e==="energy",e==="heat"){const r=.5+Math.sin(n*4)*.5;s.sun.material.opacity=.95*t,s.corona.material.opacity=(.28+r*.3)*t,s.sun.scale.setScalar(1+r*.08),s.corona.scale.setScalar(1+r*.16),s.sun.position.y=6.6+Math.sin(n*1.3)*.12,s.corona.position.copy(s.sun.position),s.sunRays.position.copy(s.sun.position),s.sunRays.rotation.z=n*.18,s.sunRays.material.opacity=(.32+r*.3)*t;const o=.5+Math.sin(n*2.6)*.5;s.mirage.scale.setScalar(1+o*.12+Math.sin(n*5.1)*.03),s.mirage.material.opacity=(.05+o*.07)*t}else if(e==="rain"){const r=.9*t,o=Math.sin(n*7.5)>.86?1:0;s.cloud.traverse(c=>{const u=c.material;if(u&&"opacity"in u){const h=u;h.opacity=r,h.emissiveIntensity=o*1.5+Math.max(0,Math.sin(n*3.3))*.06}}),s.cloud.position.y=5.6+Math.sin(n*1.5)*.16,s.cloud.position.x=Math.sin(n*.3)*.5,s.bolt.material.opacity=o*t,o>0&&(s.bolt.geometry.copy(this.makeBoltGeometry()),this.eventPulse=Math.max(this.eventPulse,.42));const a=s.rain.userData.positions,l=s.rain.userData.speeds;for(let c=0;c<l.length;c+=1){const u=c*6,h=l[c];a[u+1]-=h,a[u+4]-=h,a[u]+=h*.42,a[u+3]+=h*.42,a[u+2]+=h*.94,a[u+5]+=h*.94,a[u+1]<.1&&this.respawnRainStreak(a,l,c)}s.rain.geometry.getAttribute("position").needsUpdate=!0,s.rain.material.opacity=.55*t,s.splashes.children.forEach(c=>{const u=c,h=(n*1.7+u.userData.phase)%1;h<(u.userData.lastPhase??1)&&u.position.set((Math.random()-.5)*10,.1,(Math.random()-.5)*10),u.userData.lastPhase=h,u.scale.setScalar(.3+h*2.6),u.material.opacity=Math.max(0,(1-h)*.5)*t})}else if(e==="air"){const r=.62*t;s.smog.children.forEach(o=>{const a=o,l=a.material,c=a.userData.base,u=a.userData.phase;l.opacity=r*(1.15-c.y*.28),a.scale.setScalar(1+Math.sin(n*.6+u)*.14),a.position.set(c.x+Math.sin(n*.24+u)*.5,c.y+Math.sin(n*.4+u*2)*.12,c.z+Math.cos(n*.19+u)*.4)}),s.smog.rotation.y=n*.1,s.smog.position.y=3.3+Math.sin(n*.8)*.12,s.smog.position.x=Math.sin(n*.12)*.9}else if(e==="energy"){const r=Math.sin(n*24)>0?1:.22;s.spark.material.opacity=r*t,s.spark.rotation.y=n*3.2,Math.sin(n*24)>.96&&(s.spark.geometry.copy(this.makeSparkGeometry()),this.eventPulse=Math.max(this.eventPulse,.3))}else s.group.visible=!1}tintPolicyWorkers(e){this.policyWorkers.traverse(t=>{const n=t;if(n.isMesh){const s=n.material;s&&s.color&&s.color.setHex(e)}})}triggerHazardFx(e){this.activeHazardCue=e,this.hazardFx.group.visible=!0,this.hazardFx.group.position.copy(E_(e)),this.hazardFx.material.color.setHex(ba(e).particle),this.hazardFx.material.size=e==="rain"?.07:e==="air"?.13:e==="heat"?.1:e==="energy"?.075:.08,this.hazardShockwave.material.color.setHex(ba(e).particle),this.hazardShockwave.visible=!0,this.hazardShockwave.scale.setScalar(.4),this.hazardFxStart=this.elapsedSeconds;for(let t=0;t<this.hazardFx.positions.length/3;t+=1)Ni(this.hazardFx.positions,t,e);this.hazardFx.points.geometry.getAttribute("position").needsUpdate=!0}animatePolicyFx(e){const t=e-this.policyFxStart;if(t<0||t>2.9){this.policyFx.group.visible=!1,this.policyFx.material.opacity=0,this.policyScaffold.material.opacity=0,this.policyWorkers.visible=!1,this.policyCrane.visible=!1,this.policyCones.visible=!1,this.policyWorkPad.material.opacity=0;return}const n=nt(t/2.9,0,1),s=Math.sin(n*Math.PI),r=this.activePolicyCategory,o=this.policyShowConstruction,a=this.policyFx.positions;this.policyFx.material.opacity=.92*s,this.policyScaffold.material.opacity=o?.86*s:0,this.policyWorkPad.material.opacity=o?.26*s:0,this.policyWorkPad.scale.set(1+Math.sin(e*5.5)*.025,1,1+Math.cos(e*4.5)*.025);const c=Math.max(2,2*Math.ceil(nt(t/1.75,0,1)*(18/2)));if(this.policyScaffold.geometry.setDrawRange(0,c),this.policyWorkers.visible=o&&s>.04,this.policyCrane.visible=o&&s>.04,this.policyCones.visible=o&&s>.04,o){this.policyWorkers.children.forEach((v,m)=>{const p=typeof v.userData.phase=="number"?v.userData.phase:0;if(m===this.policyWorkers.children.length-1){const y=Math.sin(e*.75);v.position.x=-1.75+y*1.1,v.position.y=.18,v.rotation.y=Math.cos(e*.75)>=0?0:Math.PI}else v.position.y=.16+Math.abs(Math.sin(e*7.5+p))*.08,v.rotation.y+=Math.sin(e*4+p)*.012});const u=this.policyCrane.userData.jib;u.rotation.y=e*.55;const h=u.userData.hook,d=u.userData.cable,f=-1.05+Math.sin(e*1.3)*.32;h.position.y=f;const g=Math.max(.2,-f-.03);d.scale.y=g,d.position.y=f/2}for(let u=0;u<a.length/3;u+=1){const h=u*3,d=a[h],f=a[h+2];if(r==="flood")a[h]+=Math.sin(e*3+u)*.008,a[h+1]=.16+Math.sin(e*5+u)*.03,a[h+2]+=.03,a[h+2]>2.9&&cn(a,u,r);else if(r==="energy")a[h+1]+=.034+Be(u*11)*.024,a[h]+=Math.sin(e*6+u)*.014,a[h+1]>4.8&&cn(a,u,r);else if(r==="cooling")a[h+1]-=.024+Be(u*9)*.014,a[h]+=Math.sin(e*2+u)*.007,a[h+1]<.08&&cn(a,u,r);else if(r==="mobility"){const g=Math.atan2(f,d);a[h]+=Math.cos(g)*.034,a[h+2]+=Math.sin(g)*.034,a[h+1]=.12+Math.sin(e*7+u)*.03,Math.hypot(a[h],a[h+2])>3.5&&cn(a,u,r)}else if(r==="health")a[h+1]+=.02+Math.abs(Math.sin(e*3+u))*.012,a[h]+=Math.sin(e*2.4+u)*.006,a[h+2]+=Math.cos(e*2.4+u)*.006,a[h+1]>3.2&&cn(a,u,r);else if(r==="biodiversity"){const g=Math.atan2(f,d);a[h]+=Math.cos(g)*.014,a[h+2]+=Math.sin(g)*.014,a[h+1]+=.012+Be(u*5)*.008,a[h+1]>2.4&&cn(a,u,r)}else r==="industry"?(a[h+1]+=.026,a[h]+=.008+Math.sin(e*1.5+u)*.016,a[h+1]>3.8&&cn(a,u,r)):(a[h+1]+=.03,a[h+1]>3.6&&cn(a,u,r))}this.policyFx.points.geometry.getAttribute("position").needsUpdate=!0}animateHazardFx(e){const t=e-this.hazardFxStart;if(t<0||t>3.6){this.hazardFx.group.visible=!1,this.hazardFx.material.opacity=0,this.hazardShockwave.visible=!1,this.hazardShockwave.material.opacity=0,this.hazardProps.group.visible=!1;return}const n=nt(t/3.6,0,1),s=Math.sin(n*Math.PI),r=this.activeHazardCue,o=this.hazardFx.positions;this.hazardFx.material.opacity=(r==="air"?.72:.9)*s,this.updateHazardProps(r,s,e);const a=this.hazardShockwave;if(a.visible=!0,r==="rain")a.scale.setScalar(.35+n*9.6),a.material.opacity=Math.max(0,.62*(1-n)),a.rotation.z=0;else if(r==="heat"){const l=.5+Math.sin(e*6.5)*.5;a.scale.setScalar(.7+n*4.6+l*.6),a.material.opacity=Math.max(0,(.45+l*.4)*(1-n*.65)),a.rotation.z=e*.25}else if(r==="air")a.scale.setScalar(.6+n*11.5),a.material.opacity=Math.max(0,.3*(1-n)),a.rotation.z=e*.12;else if(r==="energy"){const l=Math.sin(e*34)>-.2?1:.25;a.scale.setScalar(.4+n*7.2+Math.sin(e*20)*.35),a.material.opacity=Math.max(0,.9*l*(1-n)),a.rotation.z=e*2.6}else a.scale.setScalar(.4+n*5),a.material.opacity=Math.max(0,.5*(1-n)),a.rotation.z=e*.35;for(let l=0;l<o.length/3;l+=1){const c=l*3;r==="rain"?(o[c]+=.022,o[c+1]-=.17+Be(l*5)*.09,o[c+2]+=.05,o[c+1]<.08&&Ni(o,l,r)):r==="heat"?(o[c+1]+=.06+Be(l*7)*.045,o[c]+=Math.sin(e*4.2+l)*.03,o[c+2]+=Math.cos(e*3.1+l)*.02,o[c+1]>6.4&&Ni(o,l,r)):r==="air"?(o[c]+=.058+Be(l*17)*.03,o[c+1]+=Math.sin(e*1.2+l)*.014,o[c+2]+=Math.sin(e*.8+l)*.02,o[c]>7.6&&Ni(o,l,r)):r==="energy"?(o[c]+=(Be(l*3+Math.floor(e*22))-.5)*.11,o[c+1]+=(Be(l*7+Math.floor(e*22))-.5)*.11,o[c+2]+=(Be(l*13+Math.floor(e*22))-.5)*.11,Math.hypot(o[c],o[c+2])>5.2&&Ni(o,l,r)):(o[c+1]+=.02,o[c]+=Math.sin(e*3+l)*.012)}this.hazardFx.points.geometry.getAttribute("position").needsUpdate=!0}createEventFx(){const e=new cu(16757087,.8,24,1.7);e.position.set(0,7.5,1.2);const t=new be(new un(8.2,48,24),new Wt({color:16757087,transparent:!0,opacity:.08,depthWrite:!1,blending:Et,side:Dt}));return t.position.set(0,2.4,-.8),t.scale.y=.46,{light:e,halo:t}}}const hu={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};class Qi{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const L_=new Tr(-1,1,1,-1,0,1);class D_ extends Ke{constructor(){super(),this.setAttribute("position",new We([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new We([0,2,0,0,2,0],2))}}const I_=new D_;class ao{constructor(e){this._mesh=new be(I_,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,L_)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class du extends Qi{constructor(e,t){super(),this.textureID=t!==void 0?t:"tDiffuse",e instanceof Ct?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=ys.clone(e.uniforms),this.material=new Ct({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this.fsQuad=new ao(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this.fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this.fsQuad.render(e))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}class hc extends Qi{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){const s=e.getContext(),r=e.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let o,a;this.inverse?(o=0,a=1):(o=1,a=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(s.REPLACE,s.REPLACE,s.REPLACE),r.buffers.stencil.setFunc(s.ALWAYS,o,4294967295),r.buffers.stencil.setClear(a),r.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(s.EQUAL,1,4294967295),r.buffers.stencil.setOp(s.KEEP,s.KEEP,s.KEEP),r.buffers.stencil.setLocked(!0)}}class U_ extends Qi{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class N_{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){const n=e.getSize(new ie);this._width=n.width,this._height=n.height,t=new an(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:Hn}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new du(hu),this.copyPass.material.blending=An,this.clock=new uu}swapBuffers(){const e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){const t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){e===void 0&&(e=this.clock.getDelta());const t=this.renderer.getRenderTarget();let n=!1;for(let s=0,r=this.passes.length;s<r;s++){const o=this.passes[s];if(o.enabled!==!1){if(o.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(s),o.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),o.needsSwap){if(n){const a=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(a.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),l.setFunc(a.EQUAL,1,4294967295)}this.swapBuffers()}hc!==void 0&&(o instanceof hc?n=!0:o instanceof U_&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){const t=this.renderer.getSize(new ie);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;const n=this._width*this._pixelRatio,s=this._height*this._pixelRatio;this.renderTarget1.setSize(n,s),this.renderTarget2.setSize(n,s);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(n,s)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}const O_={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`
	
		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = OptimizedCineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};class F_ extends Qi{constructor(){super();const e=O_;this.uniforms=ys.clone(e.uniforms),this.material=new d_({name:e.name,uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader}),this.fsQuad=new ao(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},Ze.getTransfer(this._outputColorSpace)===st&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===Ac?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===Cc?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===Rc?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===Za?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===Pc?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===Lc&&(this.material.defines.NEUTRAL_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this.fsQuad.render(e))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}class B_ extends Qi{constructor(e,t,n=null,s=null,r=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=s,this.clearAlpha=r,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new Ee}render(e,t,n){const s=e.autoClear;e.autoClear=!1;let r,o;this.overrideMaterial!==null&&(o=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(r=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(r),this.overrideMaterial!==null&&(this.scene.overrideMaterial=o),e.autoClear=s}}const z_={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new Ee(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			vec3 luma = vec3( 0.299, 0.587, 0.114 );

			float v = dot( texel.xyz, luma );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};class Zi extends Qi{constructor(e,t,n,s){super(),this.strength=t!==void 0?t:1,this.radius=n,this.threshold=s,this.resolution=e!==void 0?new ie(e.x,e.y):new ie(256,256),this.clearColor=new Ee(0,0,0),this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let r=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);this.renderTargetBright=new an(r,o,{type:Hn}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let h=0;h<this.nMips;h++){const d=new an(r,o,{type:Hn});d.texture.name="UnrealBloomPass.h"+h,d.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(d);const f=new an(r,o,{type:Hn});f.texture.name="UnrealBloomPass.v"+h,f.texture.generateMipmaps=!1,this.renderTargetsVertical.push(f),r=Math.round(r/2),o=Math.round(o/2)}const a=z_;this.highPassUniforms=ys.clone(a.uniforms),this.highPassUniforms.luminosityThreshold.value=s,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new Ct({uniforms:this.highPassUniforms,vertexShader:a.vertexShader,fragmentShader:a.fragmentShader}),this.separableBlurMaterials=[];const l=[3,5,7,9,11];r=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);for(let h=0;h<this.nMips;h++)this.separableBlurMaterials.push(this.getSeperableBlurMaterial(l[h])),this.separableBlurMaterials[h].uniforms.invSize.value=new ie(1/r,1/o),r=Math.round(r/2),o=Math.round(o/2);this.compositeMaterial=this.getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;const c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new C(1,1,1),new C(1,1,1),new C(1,1,1),new C(1,1,1),new C(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors;const u=hu;this.copyUniforms=ys.clone(u.uniforms),this.blendMaterial=new Ct({uniforms:this.copyUniforms,vertexShader:u.vertexShader,fragmentShader:u.fragmentShader,blending:Et,depthTest:!1,depthWrite:!1,transparent:!0}),this.enabled=!0,this.needsSwap=!1,this._oldClearColor=new Ee,this.oldClearAlpha=1,this.basic=new Wt,this.fsQuad=new ao(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this.basic.dispose(),this.fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),s=Math.round(t/2);this.renderTargetBright.setSize(n,s);for(let r=0;r<this.nMips;r++)this.renderTargetsHorizontal[r].setSize(n,s),this.renderTargetsVertical[r].setSize(n,s),this.separableBlurMaterials[r].uniforms.invSize.value=new ie(1/n,1/s),n=Math.round(n/2),s=Math.round(s/2)}render(e,t,n,s,r){e.getClearColor(this._oldClearColor),this.oldClearAlpha=e.getClearAlpha();const o=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),r&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this.fsQuad.material=this.basic,this.basic.map=n.texture,e.setRenderTarget(null),e.clear(),this.fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=n.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this.fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this.fsQuad.render(e);let a=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this.fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=a.texture,this.separableBlurMaterials[l].uniforms.direction.value=Zi.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[l]),e.clear(),this.fsQuad.render(e),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=Zi.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[l]),e.clear(),this.fsQuad.render(e),a=this.renderTargetsVertical[l];this.fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this.fsQuad.render(e),this.fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,r&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(n),this.fsQuad.render(e)),e.setClearColor(this._oldClearColor,this.oldClearAlpha),e.autoClear=o}getSeperableBlurMaterial(e){const t=[];for(let n=0;n<e;n++)t.push(.39894*Math.exp(-.5*n*n/(e*e))/e);return new Ct({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new ie(.5,.5)},direction:{value:new ie(.5,.5)},gaussianCoefficients:{value:t}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {
					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;
					for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
						float x = float(i);
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += (sample1 + sample2) * w;
						weightSum += 2.0 * w;
					}
					gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
				}`})}getCompositeMaterial(e){return new Ct({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`varying vec2 vUv;
				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor(const in float factor) {
					float mirrorFactor = 1.2 - factor;
					return mix(factor, mirrorFactor, bloomRadius);
				}

				void main() {
					gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
						lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
						lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
						lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
						lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
				}`})}}Zi.BlurDirectionX=new ie(1,0);Zi.BlurDirectionY=new ie(0,1);function k_(i,e,t){const n=new N_(i);n.addPass(new B_(e,t));const s=new Zi(new ie(window.innerWidth,window.innerHeight),.62,.85,.62);n.addPass(s);const r=new du({uniforms:{tDiffuse:{value:null},uContrast:{value:1.12},uSaturation:{value:1.18},uVignette:{value:.32},uWarmShadows:{value:new Ee(1712696)},uWarmHighlights:{value:new Ee(16771268)},uGrain:{value:.035}},vertexShader:`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:`
      varying vec2 vUv;
      uniform sampler2D tDiffuse;
      uniform float uContrast;
      uniform float uSaturation;
      uniform float uVignette;
      uniform vec3 uWarmShadows;
      uniform vec3 uWarmHighlights;
      uniform float uGrain;

      // 簡易雜訊（膠片顆粒）
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      void main() {
        vec4 texel = texture2D(tDiffuse, vUv);
        vec3 color = texel.rgb;

        // 飽和度
        float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
        color = mix(vec3(luma), color, uSaturation);

        // 對比
        color = (color - 0.5) * uContrast + 0.5;

        // 暖冷分色：暗部染冷、亮部染暖，提升層次與電影感
        vec3 splitTone = mix(uWarmShadows / 255.0 * 3.0, uWarmHighlights / 255.0, smoothstep(0.0, 1.0, luma));
        color = mix(color, color * (0.85 + splitTone * 0.6), 0.35);

        // 平滑暗角
        float d = distance(vUv, vec2(0.5));
        float edge = smoothstep(0.2, 0.95, d);
        color *= 1.03 - edge * uVignette;

        // 膠片顆粒（靜態，依像素位置）
        float grain = (hash(vUv * 1024.0) - 0.5) * uGrain;
        color += grain;

        gl_FragColor = vec4(clamp(color, 0.0, 1.0), texel.a);
      }
    `});return n.addPass(r),n.addPass(new F_),n}function H_(){const i=new Tr(-12,12,8,-8,.1,200);return i.position.set(15,16,15),i.lookAt(0,.4,-.8),fu(i,window.innerWidth,window.innerHeight),i}function fu(i,e,t){const n=e/Math.max(1,t),s=e<760?23:e<1100?21:17.4,r=s*n;i.left=-r/2,i.right=r/2,i.top=s/2,i.bottom=-s/2,i.updateProjectionMatrix()}function G_(i){const e=new $0({canvas:i,antialias:!0,powerPreference:"high-performance"});return e.setPixelRatio(Math.min(window.devicePixelRatio,1.5)),e.setSize(window.innerWidth,window.innerHeight,!1),e.outputColorSpace=Kt,e.toneMapping=Za,e.toneMappingExposure=1.12,e.shadowMap.enabled=!0,e.shadowMap.type=Tc,e}function V_(){const i=new q0;i.background=new Ee(528409),i.fog=new Ar(662824,.025);const e=new f_(12576511,2765600,1.25);i.add(e);const t=new Ma(16773320,3.7);t.position.set(-7,12,8),t.castShadow=!0,t.shadow.mapSize.set(2048,2048),t.shadow.camera.left=-18,t.shadow.camera.right=18,t.shadow.camera.top=18,t.shadow.camera.bottom=-18,t.shadow.bias=-15e-5,t.shadow.normalBias=.04,i.add(t);const n=new Ma(7060991,.9);n.position.set(9,5,-8),i.add(n);const s=new Ma(9437138,1.25);s.position.set(4,9,-12),i.add(s);const r=new cu(16767392,.6,26,2);return r.position.set(0,6,-1),i.add(r),i}function W_(i,e,t){const n=G_(i),s=V_(),r=H_(),o=k_(n,s,r),a=X_(r,i),l=new P_(s,e),c=new g_,u=new ie,h=new uu;let d=0,f=!1,g=document.hidden;const v=1e3/40;let m=0;const p=()=>$_(n,o,r);window.addEventListener("resize",p);const E=()=>{g=document.hidden};document.addEventListener("visibilitychange",E);const y=D=>{var P,k;const R=i.getBoundingClientRect();u.x=(D.clientX-R.left)/R.width*2-1,u.y=-((D.clientY-R.top)/R.height)*2+1,c.setFromCamera(u,r);const U=((P=c.intersectObjects(l.pickables,!0)[0])==null?void 0:P.object)??null,b=l.findCellTarget(U);if(b&&((k=t.onPickCell)!=null&&k.call(t,b.districtId,b.cellIndex)))return;const M=l.findDistrictId(U);M&&t.onSelectDistrict(M)};i.addEventListener("pointerdown",y);const T=(D=0)=>{if(f||(d=window.requestAnimationFrame(T),g)||D-m<v)return;m=D;const R=h.getElapsedTime();l.tick(R),a.update(),o.render()};return{update:D=>l.updateFromState(D),playYearTransition:D=>l.playYearTransition(D),setDataLayer:D=>l.setDataLayer(D),start:()=>{p(),T()},dispose:()=>{f=!0,window.cancelAnimationFrame(d),window.removeEventListener("resize",p),document.removeEventListener("visibilitychange",E),i.removeEventListener("pointerdown",y),a.dispose(),n.dispose()}}}function X_(i,e){const t=new v_(i,e);return t.enableDamping=!0,t.dampingFactor=.08,t.minZoom=.62,t.maxZoom=1.65,t.minPolarAngle=Math.PI*.22,t.maxPolarAngle=Math.PI*.38,t.enableRotate=!0,t.enablePan=!0,t.target.set(0,.4,-1),t}function $_(i,e,t){const n=window.innerWidth,s=window.innerHeight;i.setPixelRatio(Math.min(window.devicePixelRatio,1.5)),i.setSize(n,s,!1),e.setSize(n,s),fu(t,n,s)}function Xt(i,e=1){return Number.isFinite(i)?i.toFixed(e):"資料缺漏"}function q_(i,e=1){return Number.isFinite(i)?`${i>0?"+":""}${i.toFixed(e)}`:"資料缺漏"}function pu(i){return Number.isFinite(i)?`${Math.round(i*100)}%`:"資料缺漏"}function mu(i){return Number.isFinite(i)?Math.round(i).toLocaleString("zh-TW"):"資料缺漏"}function ms(i){return i.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function oo(i){return`${Number.isInteger(i.current)?String(i.current):i.current.toFixed(1)}${i.unit??""}`}function xr(i){return`${Math.round(i)} 百萬`}function gu(i){const e={"SDG 3":"健康福祉","SDG 6":"潔淨水","SDG 7":"可負擔能源","SDG 9":"產業創新","SDG 10":"減少不平等","SDG 11":"永續城市","SDG 12":"責任消費","SDG 13":"氣候行動","SDG 15":"陸域生態"};return i.map(t=>`${t} ${e[t]??""}`.trim()).join(" / ")}function Y_(i){return{emissions:"排放",heatRisk:"熱風險",floodRisk:"洪水風險",airQualityRisk:"空氣風險",publicHealth:"公共健康",equity:"公平性",publicTrust:"公共信任",biodiversity:"生物多樣性",energySecurity:"能源安全",educationScore:"教育分數"}[i]??i}function j_(i){return i==="emissions"||i==="heatRisk"||i==="floodRisk"||i==="airQualityRisk"}function gs(i){return i>=72?"danger":i>=54?"warn":"good"}function lo(i){return i>=68?"good":i>=50?"warn":"danger"}function K_(i){const e=i.mission,t=Hu(i),n=qa(i),s=e.objectives.filter(r=>r.passed).length;return`
    <section class="mission-chip mission-panel-open">
      <div>
        <span>${e.chapter}</span>
        <strong>${e.title}</strong>
      </div>
      <div class="chip-stats">
        <b>${t}</b><small>回合</small>
        <b>${n}/${e.policyLimitPerTurn}</b><small>政策</small>
        <b>${s}/${e.objectives.length}</b><small>目標</small>
      </div>
      <div class="mission-objectives">
        ${e.objectives.map(nv).join("")}
      </div>
    </section>
  `}function Z_(i){return`
    <section class="year-feed">
      <div class="year-feed-row">
        <div>
          <span>本年意外事件</span>
          <strong>${i.currentChallenge.title}</strong>
        </div>
        <button class="text-link" type="button" data-open-guide="challenge">解析</button>
      </div>
      ${i.lastResolution?`<div class="year-feed-row previous">
              <div>
                <span>上一年結算</span>
                <strong>${i.lastResolution.year}: ${i.lastResolution.title}</strong>
              </div>
              <button class="text-link" type="button" data-open-guide="resolution">查看</button>
            </div>`:""}
    </section>
  `}function J_(i,e){return`
    <section class="district-chip-panel">
      <span>目前街區</span>
      <strong>${e.name}</strong>
      <div class="mini-stat-row">
        ${Bi("熱",e.heatExposure,!1)}
        ${Bi("水",e.floodExposure,!1)}
        ${Bi("空污",e.airPollution,!1)}
        ${Bi("健康",e.healthIndex,!0)}
        ${Bi("公平",e.equityIndex,!0)}
        ${Bi("韌性",e.resilienceIndex,!0)}
      </div>
      <button class="text-link" type="button" data-open-guide="district">街區詳情</button>
    </section>
  `}function Q_(i,e,t){const n=i.mission.status==="active"&&i.phase!=="complete"&&!t;return`
    <section class="command-bar" aria-label="主要行動">
      <div>
        <span>政策審議</span>
        <strong>本回合還可確認 ${Sr(i)} 項政策</strong>
      </div>
      <div class="dock-actions">
        <button class="ghost-btn sound-btn ${e?"enabled":""}" type="button" data-toggle-audio>
          ${e?"音效開":"啟動音效"}
        </button>
        <button class="ghost-btn" type="button" data-open-policy-board ${t?"disabled":""}>打開政策桌</button>
        <button class="primary-btn" type="button" data-advance ${n?"":"disabled"}>${t?"模擬中":"下一年"}</button>
      </div>
    </section>
  `}function Oi(i,e,t,n){return`
    <div class="metric ${n}">
      <span>${i}</span>
      <strong>${Math.round(e)}${t}</strong>
    </div>
  `}function ev(i,e){const t=Ya(e,i.id),n=!(t!=null&&t.affordable);return`
    <button class="policy-card ${i.category} ${n?"locked":""}" type="button" data-policy="${i.id}">
      <span class="policy-cost">${xr(i.cost)}</span>
      <strong>${i.name}</strong>
      <small>${gu(i.sdgs)}</small>
      <p>${i.summary}</p>
      <span class="inspect-label">查看政策</span>
      ${t?`<div class="preview-row">
              ${wt("熱風險",t.deltas.heatRisk,!0)}
              ${wt("健康",t.deltas.publicHealth,!1)}
              ${wt("公平",t.deltas.equity,!1)}
              ${wt("SDGs",t.deltas.sdgScore,!1)}
            </div>`:""}
    </button>
  `}function tv(i){return`
    <div class="objective ${i.passed?"passed":""}">
      <span>${i.passed?"達成":"追蹤"}</span>
      <strong>${i.label}</strong>
      <small>目前 ${oo(i)}</small>
    </div>
  `}function nv(i){return`
    <div class="mission-objective ${i.passed?"passed":""}">
      <span>${i.passed?"達成":"追蹤"}</span>
      <strong>${i.label}</strong>
      <small>${oo(i)}</small>
    </div>
  `}function Fi(i,e,t){return`
    <div class="district-stat ${t?lo(e):gs(e)}">
      <span>${i}</span>
      <strong>${Math.round(e)}</strong>
    </div>
  `}function Bi(i,e,t){return`
    <span class="mini-stat ${t?lo(e):gs(e)}">
      ${i}<b>${Math.round(e)}</b>
    </span>
  `}function iv(i,e){return`
    <button
      type="button"
      class="district-chip ${i.id===e?"selected":""}"
      data-district="${i.id}"
    >
      ${i.name}
    </button>
  `}function wt(i,e,t){const n=Math.round(e*10)/10,s=t?n<0:n>0,r=t?n>0:n<0,o=s?"good":r?"danger":"neutral",a=n>0?"+":"";return`
    <span class="delta-chip ${o}">
      ${i} ${a}${n}
    </span>
  `}function sv(i,e){const t=Ya(i,e.id);if(i.mission.status==="briefing")return"請先開始任務，再確認政策投資。";if(i.phase==="complete")return"任務已結束，請使用重製任務重新開始。";if(!(t!=null&&t.canAffordBudget))return`預算不足：目前剩餘 ${xr(i.budget)}。`;if(((t==null?void 0:t.remainingActions)??0)<=0)return"本回合政策額度已用完，請進入下一年。"}const rv=[{name:"Open-Meteo",role:"Weather and climate stressors.",url:"https://open-meteo.com/en/docs",licenseOrAccess:"Free public API, no key for normal use.",productionUse:"Temperature, precipitation, wind, flood expansion, and classroom-friendly live data."},{name:"NASA POWER",role:"Solar radiation and climate-energy signals.",url:"https://power.larc.nasa.gov/docs/services/api/",licenseOrAccess:"Free public API.",productionUse:"Solar potential, precipitation, temperature, and renewable energy missions."},{name:"World Bank Indicators API",role:"Population and development indicators.",url:"https://datahelpdesk.worldbank.org/knowledgebase/articles/889392",licenseOrAccess:"Free public API, no key.",productionUse:"Population, urbanization, energy access, GDP, education, and health context."},{name:"UNSD SDG API",role:"Official SDG metadata.",url:"https://unstats.un.org/SDGAPI/swagger/",licenseOrAccess:"Free public API.",productionUse:"SDG indicator labels, official framing, and report outputs."},{name:"Open-Meteo Air Quality (CAMS)",role:"Air quality (PM2.5) without an API key.",url:"https://open-meteo.com/en/docs/air-quality-api",licenseOrAccess:"Free public API, no key. Data from Copernicus CAMS.",productionUse:"Default real-time PM2.5 source feeding the US EPA AQI and air-risk model."},{name:"OpenAQ (optional)",role:"Ground-station air quality observations.",url:"https://docs.openaq.org/about/about",licenseOrAccess:"Free account, API key required.",productionUse:"Optional: when a key is supplied, station PM2.5 overrides the CAMS reanalysis. Keep key out of client code for production."}];function av(i,e,t,n){const s=mv(i),r=ov(i),o=uv(t);return`
    <section class="modal-scrim data-scrim">
      <article class="guide-card data-briefing-card">
        <button class="close-btn" type="button" aria-label="關閉資料教學" data-close-data-guide>x</button>
        <span>城市資料診斷課</span>
        <h1>今天的台北，哪裡最需要被保護？</h1>
        <p>
          你現在不是在看一份 API 清單，而是在替一座城市做上場前的健康檢查。等一下你會用有限預算做政策選擇，
          所以先要讀懂：現在最危險的是熱、雨、空氣，還是哪個街區特別脆弱。
        </p>
        ${e==="loading"?'<div class="data-loading-strip">公開資料載入中，請稍候...</div>':""}
        ${e==="error"?`<div class="data-status-error">資料載入失敗：${ms(n??"未知錯誤")}</div>`:""}

        <div class="data-lesson-hero">
          <section class="lesson-role-card">
            <span>你的角色</span>
            <h2>城市韌性決策小組</h2>
            <p>
              你要在 4 回合內降低風險、守住公共健康，還要注意政策是否照顧到弱勢街區。
              每次按下政策前，都要能說出「我根據哪個資料做判斷」。
            </p>
          </section>
          <section class="lesson-checklist">
            <span>開始前先回答</span>
            <b>這些數據正在告訴我什麼風險？</b>
            <ul>
              <li>哪一種災害壓力最明顯？</li>
              <li>哪一種街區會被放大傷害？</li>
              <li>哪個政策最能對準任務目標？</li>
            </ul>
          </section>
        </div>

        <section class="data-section">
          <div class="data-section-title">
            <span>1</span>
            <div>
              <h2>先讀城市病歷：四個風險問題</h2>
              <p>不要先背數字。先把每個數字翻成一個生活問題，才會知道政策為什麼有用。</p>
            </div>
          </div>
          <div class="risk-story-grid">
            ${r.map(a=>`
                  <article class="risk-story-card ${a.tone}">
                    <span>${a.kicker}</span>
                    <h3>${a.title}</h3>
                    <strong>${a.value}</strong>
                    <p>${a.question}</p>
                    <small>${a.whyItMatters}</small>
                    <b>${a.policyHint}</b>
                  </article>
                `).join("")}
          </div>
        </section>

        <section class="data-section">
          <div class="data-section-title">
            <span>2</span>
            <div>
              <h2>四個科學概念：為什麼同一場災害傷害不同人？</h2>
              <p>氣候災害不是只有天氣本身，還要看城市表面、地形、服務可近性與社會差異。</p>
            </div>
          </div>
          <div class="concept-grid">
            ${lv()}
          </div>
        </section>

        <section class="data-section">
          <div class="data-section-title">
            <span>3</span>
            <div>
              <h2>本次任務起始數據：看單位，也看方向</h2>
              <p>這些數字會變成遊戲初始條件。數值越大不一定越好或越壞，要看它代表壓力、資源還是人口背景。</p>
            </div>
          </div>
          <div class="data-signal-grid">
            ${s.map(a=>`
                  <article class="data-signal-card" data-signal="${a.key}">
                    <span>${a.label}</span>
                    <strong>${a.value}</strong>
                    <p>${a.meaning}</p>
                    <small>${a.gameLink}</small>
                  </article>
                `).join("")}
          </div>
        </section>

        <section class="data-section">
          <div class="data-section-title">
            <span>4</span>
            <div>
              <h2>資料如何接到後面的模擬任務</h2>
              <p>同一個城市壓力會因街區條件不同而放大或降低，所以政策不是平均撒錢，而是要找出脆弱處。</p>
            </div>
          </div>
          <div class="data-bridge-grid">
            ${gv(i)}
          </div>
        </section>

        <section class="data-section data-reading-flow">
          <div class="data-section-title">
            <span>5</span>
            <div>
              <h2>開始任務前的三個判讀題</h2>
              <p>這不是操作說明，而是進入模擬前的科學推理暖身。</p>
            </div>
          </div>
          <div class="student-question-grid">
            ${cv()}
          </div>
        </section>

        <section class="data-section">
          <div class="data-section-title">
            <span>6</span>
            <div>
              <h2>資料品質與限制</h2>
              <p>${o}</p>
            </div>
          </div>
          <div class="source-summary-strip">
            ${hv(t)}
          </div>
          <div class="data-source-table">
            <div class="data-source-head">
              <b>來源</b><b>提供的線索</b><b>判讀限制</b>
            </div>
            ${dv(t)}
          </div>
        </section>

        <div class="data-tutorial-actions">
          <button class="ghost-btn large" type="button" data-close-data-guide>回到任務簡介</button>
          <button class="primary-btn large" type="button" data-start-mission ${e==="ready"?"":"disabled"}>
            我已理解資料，開始任務
          </button>
        </div>
      </article>
    </section>
  `}function ov(i){const e=i.climateSignals;return[{kicker:"熱",title:"近年暑季是否已經有熱浪壓力？",value:`${Xt(e.heatwaveDaysPerSeason)} 熱浪日 / ${Xt(e.tropicalNightsPerSeason)} 熱夜`,question:"這裡看的是近 5 個完整暖季，不是今天。熱浪日越多，代表城市每年需要面對的高溫壓力越常出現。",whyItMatters:"熱夜會讓身體沒有恢復時間，會增加中暑、用電尖峰與戶外工作風險。",policyHint:"等一下優先檢查：樹冠降溫、降溫避難網、弱勢街區可近性。",tone:"heat"},{kicker:"雨",title:"雨季強降雨是否讓街區更容易積水？",value:`${Xt(e.heavyRainDaysPerSeason)} 強降雨日 / ${Xt(e.precipitationAnomalyRatio,2)} 倍`,question:"這裡看近 5 個完整暖季的強降雨日與雨量異常，不是某一天剛好下大雨。",whyItMatters:"同一場雨，低窪河岸和鋪面多的街區會比高地或濕地旁更容易積水。",policyHint:"等一下優先檢查：海綿街廓、濕地緩衝、防洪能力。",tone:"rain"},{kicker:"空氣",title:"空污會不會讓健康分數掉得更快？",value:`${Xt(e.pm25UgM3)} µg/m³ PM2.5`,question:"PM2.5 很小，可以進入呼吸系統；產業排放、交通與風速都會影響暴露。",whyItMatters:"老人、兒童、氣喘族群與戶外工作者，通常不是平均承受風險。",policyHint:"等一下優先檢查：產業空污治理、電動公車、空氣監測網。",tone:"air"},{kicker:"城市",title:"人口集中會不會放大政策後果？",value:`${mu(e.population)} 人 / 都市人口 ${pu(e.urbanPopulationRatio)}`,question:"人越集中，交通、排水、能源、綠地和避難設施就越需要精準配置。",whyItMatters:"公共健康與公平性不是抽象分數，而是關係到許多人的日常風險與服務可近性。",policyHint:"等一下優先檢查：公共健康、公平性、SDG 11 永續城市。",tone:"civic"}]}function lv(){return[{title:"暴露",body:"人、建築、道路或學校是否位在高溫、淹水、空污會影響的地方。",example:"例：河岸住宅區遇到豪雨，比高地更容易被水影響。"},{title:"脆弱度",body:"同樣遇到災害，哪些族群或街區比較缺少資源保護自己。",example:"例：老人、兒童、戶外工作者，面對熱浪時健康風險更高。"},{title:"調適",body:"用工程、自然系統與社會服務降低災害造成的傷害。",example:"例：樹蔭、避難點、海綿鋪面和濕地都屬於調適策略。"},{title:"取捨",body:"預算和政策數量有限，不能第一年把全部政策都買完。",example:"例：先救熱風險最高街區，可能暫時犧牲能源或產業治理速度。"}].map(e=>`
        <article class="concept-card">
          <h3>${e.title}</h3>
          <p>${e.body}</p>
          <small>${e.example}</small>
        </article>
      `).join("")}function cv(){return[{title:"先判斷主要威脅",prompt:"熱、雨、空氣三種壓力中，哪一種最可能讓本關失敗？你用哪個數值判斷？"},{title:"再判斷脆弱街區",prompt:"同樣的氣候壓力落到不同街區，哪裡會被放大？是低海拔、少樹蔭、交通弱，還是產業負荷高？"},{title:"最後選政策證據",prompt:"如果只能確認 2 項政策，你要先投資哪兩項？請說出它們分別對準哪個風險與任務目標。"}].map((e,t)=>`
        <article class="student-question-card">
          <span>${t+1}</span>
          <h3>${e.title}</h3>
          <p>${e.prompt}</p>
        </article>
      `).join("")}function uv(i){const e=i.filter(s=>s.status==="loaded").length,t=i.filter(s=>s.status==="failed"||s.status==="skipped").length,n=i.filter(s=>s.status==="fallback").length;return`本次整理到 ${e} 個即時來源，${t} 個來源受網路、API key 或缺測限制影響，${n} 個基準補值來源用來補足欄位。這不是要學生相信每個數字都完美，而是練習判斷資料品質。`}function hv(i){const e=i.reduce((n,s)=>({...n,[s.status]:n[s.status]+1}),{loaded:0,failed:0,skipped:0,fallback:0});return[["loaded","即時載入"],["failed","連線失敗"],["skipped","缺 key 或缺測"],["fallback","基準補值"]].map(([n,s])=>`<span class="source-status-badge ${n}">${s} ${e[n]}</span>`).join("")}function dv(i){const e=new Map(i.map(n=>[n.name,n]));return[...rv.map(n=>{const s=pv(n.name),r=e.get(n.name);return{name:n.name,url:n.url,status:r,pulledData:s.pulledData,studentNote:s.studentNote}}),{name:"台北本地基準補值",url:"/data/taipei-climate-baseline.json",status:e.get("台北本地基準補值"),pulledData:"作為教室離線或 API 缺項時的台北基準補值，避免單一資料源失效讓課程中斷。",studentNote:"不是玩家可切換的假資料；它用來補足缺漏欄位，讓同一套任務仍能討論資料不確定性。"}].map(n=>`
        <div class="data-source-row">
          <div>
            <a href="${n.url}" target="_blank" rel="noreferrer">${n.name}</a>
            ${n.status?fv(n.status):""}
          </div>
          <p>${n.pulledData}</p>
          <p>
            ${n.studentNote}
            ${n.status?`<small class="source-status-note">目前狀態：${ms(n.status.note)}</small>`:""}
          </p>
        </div>
      `).join("")}function fv(i){const e={loaded:"已載入",failed:"失敗",skipped:"略過",fallback:"補值"};return`<span class="source-status-badge ${i.status}">${e[i.status]}</span>`}function pv(i){return{"Open-Meteo":{pulledData:"近 5 個完整暖季的每日最高溫、最低溫、平均溫與日雨量，轉成熱浪日、熱夜、強降雨日與暖季月雨量。",studentNote:"用來回答「近年暑季與雨季風險是否常態化」，會直接推動熱風險與洪水風險分數。"},"NASA POWER":{pulledData:"同一段近 5 個完整暖季的每日太陽輻射，補強能源與太陽能潛力判讀。",studentNote:"用來討論為什麼屋頂太陽能、能源韌性與極端高溫會被放進同一個城市決策。"},"World Bank Indicators API":{pulledData:"國家尺度人口與都市人口比例，作為城市暴露人口與都市化背景。",studentNote:"不是街區人口普查，而是宏觀背景；學生要理解尺度不同時，資料解釋也會不同。"},"UNSD SDG API":{pulledData:"永續發展目標的官方指標語彙與分類，對應政策卡上的 SDG 學習框架。",studentNote:"它不直接改變熱風險或洪水風險，而是協助把政策效果連到 SDG 3、6、7、11、13 等目標。"},"Open-Meteo 空氣品質（CAMS）":{pulledData:"近 7 天的逐時 PM2.5（哥白尼大氣監測 CAMS 全球/歐洲再分析），平均後作為當前空污輸入。",studentNote:"免金鑰即可取得真實 PM2.5，會換算成 US EPA AQI 後推動空氣風險與公共健康分數。"},"OpenAQ（選用，需 API key）":{pulledData:"地面測站的 PM2.5 觀測；提供 API key 時，會以更在地的測站值覆蓋 CAMS 再分析值。",studentNote:"比較 CAMS 再分析與地面測站，可討論「模式 vs 實測」以及資料尺度與代表性的差異。"}}[i]??{pulledData:"公開資料源。",studentNote:"請在課堂上檢查資料來源、尺度、時間與可能限制。"}}function mv(i){const e=i.climateSignals;return[{key:"meanTemperatureC",label:"暖季平均氣溫",value:`${Xt(e.meanTemperatureC)} °C`,meaning:"近 5 個完整暖季的近地面平均溫度，用來描述城市暑季背景，而不是今天氣溫。",gameLink:"進入熱風險換算；與熱浪日、熱夜一起形成城市熱壓力。"},{key:"temperatureAnomalyC",label:"暖季溫度異常",value:`${q_(e.temperatureAnomalyC)} °C`,meaning:"代表暖季平均氣溫相對 27 °C 教學基準偏高或偏低多少。",gameLink:"正值越大，熱風險分數越高；樹冠與降溫避難設施會降低影響。"},{key:"heatwaveDaysPerSeason",label:"熱浪日",value:`${Xt(e.heatwaveDaysPerSeason)} 日/暖季`,meaning:"近 5 個完整暖季中，每年平均最高溫達熱浪門檻的天數。",gameLink:"直接轉入熱風險分數，讓關卡主題不受今天剛好熱不熱影響。"},{key:"tropicalNightsPerSeason",label:"熱夜",value:`${Xt(e.tropicalNightsPerSeason)} 日/暖季`,meaning:"近 5 個完整暖季中，每年平均夜間最低溫仍偏高的天數。",gameLink:"熱夜會加重健康壓力，特別影響老舊住宅與弱勢族群。"},{key:"monthlyPrecipitationMm",label:"暖季月雨量",value:`${Xt(e.monthlyPrecipitationMm,0)} mm`,meaning:"近 5 個完整暖季的平均每月雨量，協助學生感覺雨季累積壓力。",gameLink:"會推動洪水暴露；低海拔、河岸、海港與不透水鋪面多的街區更容易被放大。"},{key:"precipitationAnomalyRatio",label:"降雨異常倍率",value:`${Xt(e.precipitationAnomalyRatio,2)} 倍`,meaning:"把暖季月雨量與強降雨日合併成雨季壓力倍率。1 倍附近代表接近教學基準，高於 1 代表偏濕或強降雨偏多。",gameLink:"倍率越高，下一年遇到豪雨或排水不足事件時，洪水風險會更難壓低。"},{key:"heavyRainDaysPerSeason",label:"強降雨日",value:`${Xt(e.heavyRainDaysPerSeason)} 日/暖季`,meaning:"近 5 個完整暖季中，每年平均單日雨量達強降雨門檻的天數。",gameLink:"直接轉入洪水風險分數，尤其會放大河岸、海港與低窪街區風險。"},{key:"pm25UgM3",label:"PM2.5",value:`${Xt(e.pm25UgM3)} µg/m³`,meaning:"細懸浮微粒會進入呼吸系統，對老人、兒童、氣喘族群與戶外工作者影響較大。",gameLink:"進入空氣風險與公共健康計算；產業空污治理、電動公車與監測網會降低暴露。"},{key:"solarKwhM2Day",label:"太陽輻射",value:`${Xt(e.solarKwhM2Day,2)} kWh/m²/day`,meaning:"表示每天每平方公尺大約可接收多少太陽能，是估計屋頂太陽能潛力的線索。",gameLink:"支援屋頂太陽能與能源韌性政策；日照條件越好，低碳能源投資越容易被解釋。"},{key:"population",label:"人口背景",value:`${mu(e.population)} 人`,meaning:"代表暴露人口的背景尺度。人口越集中，政策失誤或災害影響的人數可能越多。",gameLink:"用來提醒玩家：公共健康與公平性不是抽象分數，而是關係到很多人的日常風險。"},{key:"urbanPopulationRatio",label:"都市人口比",value:`${pu(e.urbanPopulationRatio)}`,meaning:"表示人口集中在都市地區的比例。都市化越高，熱島、交通與排水壓力越需要治理。",gameLink:"連到 SDG 11 永續城市；政策要同時考慮基礎設施、交通、綠地與弱勢可近性。"}]}function gv(i){return[{title:"熱風險",score:`目前 HUD：${Math.round(i.heatRisk)}`,formula:"暖季溫度異常 + 熱浪日 + 熱夜 + 不透水鋪面 - 樹冠覆蓋 - 降溫可近性",explanation:"遊戲會先把近 5 個暖季的熱浪資料換成熱壓力，再依街區柏油、樹蔭與避難點調整。",policies:"都市樹冠降溫、降溫避難網、公民科學監測網"},{title:"洪水風險",score:`目前 HUD：${Math.round(i.floodRisk)}`,formula:"暖季月雨量 + 強降雨日 + 降雨異常倍率 + 低海拔/河岸/海港 - 防洪能力",explanation:"遊戲會先把多年雨季強降雨換成水壓力，再依地形高度、排水、濕地與不透水面調整。",policies:"海綿街廓改造、濕地緩衝帶、河岸街區治理"},{title:"空氣風險",score:`目前 HUD：${Math.round(i.airQualityRisk)}`,formula:"PM2.5 + 產業負荷 - 大眾運輸可近性 - 樹冠覆蓋",explanation:"PM2.5 先換成空污壓力，再依產業區、交通可近性與樹冠覆蓋調整街區暴露。",policies:"產業空污治理、電動公車與低碳路網、公民科學監測網"},{title:"公共健康與公平性",score:`健康 ${Math.round(i.publicHealth)} / SDGs ${Math.round(i.sdgScore)}`,formula:"熱、洪水、空污風險 + 服務可近性 + 弱勢街區差異",explanation:"公共健康會由三種暴露分數扣分，再由降溫可近性與公平性補回；SDG 分數也會跟著變動。",policies:"降溫避難網、街區監測、公平導向的政策排序"}].map(t=>`
        <article class="data-bridge-card">
          <h3>${t.title}</h3>
          <em>${t.score}</em>
          <b>${t.formula}</b>
          <p>${t.explanation}</p>
          <small>政策連結：${t.policies}</small>
        </article>
      `).join("")}function _v(i){return`
    <section class="year-transition-panel" aria-live="polite">
      <span>年度模擬中</span>
      <strong>政策施工與意外事件正在城市中發生</strong>
      <div class="year-transition-track">
        <i></i>
      </div>
      <p>正在執行 ${qa(i)} 項政策，接著結算本年度意外事件。</p>
    </section>
  `}function vv(i){return`
    <section class="modal-scrim policy-board-scrim">
      <article class="policy-board-panel">
        <button class="close-btn" type="button" aria-label="關閉政策桌" data-close-policy-board>x</button>
        <span>政策審議桌</span>
        <h1>先閱讀，再確認投資</h1>
        <p>預算以百萬計算。每回合最多確認 ${i.mission.policyLimitPerTurn} 項政策，目前還可確認 ${Sr(i)} 項。</p>
        <div class="policy-row">
          ${Xa.map(e=>ev(e,i)).join("")}
        </div>
      </article>
    </section>
  `}function xv(i,e,t){const n=i.mission,s=e==="loading",r=e==="ready",o=e==="error";return`
    <section class="modal-scrim">
      <div class="briefing-card">
        <span>${n.chapter}</span>
        <h1>${n.title}</h1>
        <p>${n.briefing}</p>
        <p>${n.stakes}</p>
        <div class="briefing-objectives">
          ${n.objectives.map(a=>`<div>${a.label}</div>`).join("")}
        </div>
        <div class="scenario-picker">
          <strong>選擇副本任務</strong>
          <p>四個獨立副本，各自考驗不同的氣候調適策略。隨時可重新開始換副本。</p>
          <div class="mission-options">
            ${zu.map(a=>`
                <button type="button" class="scenario-option ${i.missionIndex===a.index?"active":""}" data-mission="${a.index}">
                  <strong>${a.title}</strong>
                  <p>${a.blurb}</p>
                </button>
              `).join("")}
          </div>
        </div>
        <div class="scenario-picker">
          <strong>選擇全球排放情境（IPCC AR6 SSP）</strong>
          <p>城市減排無法改變全球溫度——「減緩」是全球集體行動，「調適」才是城市能掌握的。情境決定逐年升溫與極端事件趨勢。</p>
          <div class="scenario-options">
            ${Aa.map(a=>`
                <button type="button" class="scenario-option ${i.scenario===a.id?"active":""}" data-scenario="${a.id}">
                  <strong>${a.shortName}</strong>
                  <small>+${a.warmingPerYearC.toFixed(3)}°C/年</small>
                  <p>${a.description}</p>
                </button>
              `).join("")}
          </div>
        </div>
        <div class="briefing-data-note ${o?"error":r?"ready":""}">
          <strong>${r?"資料來源已整理":o?"資料載入失敗":"任務開始前需先載入公開資料"}</strong>
          <p>
            ${r?"開始前請先閱讀資料來源、載入狀態、指標意義與模擬判讀方式，理解數據如何連到後面的政策任務。":o?`目前無法完成資料載入：${t??"未知錯誤"}。請確認網路後重試。`:"系統會呼叫 Open-Meteo、NASA POWER（搭配內政部人口統計與 OpenAQ 選用），整理成台北城市韌性任務的起始數據。"}
          </p>
        </div>
        <div class="briefing-actions">
          ${r?`<button class="ghost-btn large" type="button" data-open-data-guide>查看資料解讀</button>
                 <button class="primary-btn large" type="button" data-start-mission>我已理解，開始任務</button>`:`<button class="primary-btn large" type="button" data-live-data ${s?"disabled":""}>
                  ${s?"資料載入中...":o?"重新載入公開資料":"載入公開資料與前置教學"}
                </button>`}
        </div>
      </div>
    </section>
  `}function yv(i){const e=i.mission.status==="won",t=i.mission;return`
    <section class="modal-scrim">
      <div class="briefing-card ending ${e?"won":"lost"}">
        <span>${e?"任務成功":"任務失敗"}</span>
        <h1>${t.debriefTitle??t.title}</h1>
        <p>${t.debriefBody??""}</p>
        <div class="briefing-objectives">
          ${t.objectives.map(tv).join("")}
        </div>
        <div class="briefing-actions">
          <button class="primary-btn large" type="button" data-pick-mission>選擇其他副本</button>
          <button class="ghost-btn large" type="button" data-restart-game>重新開始整場遊戲</button>
        </div>
      </div>
    </section>
  `}function Mv(i,e){const t=Ya(i,e.id),n=sv(i,e),s=!n&&(t==null?void 0:t.affordable);return`
    <section class="modal-scrim policy-scrim">
      <article class="policy-detail-card ${e.category}">
        <button class="close-btn" type="button" aria-label="關閉政策詳情" data-close-policy>x</button>
        <span class="policy-kicker">${gu(e.sdgs)}</span>
        <h1>${e.name}</h1>
        <p class="policy-lead">${e.summary}</p>
        <div class="policy-detail-meta">
          <div><span>花費</span><strong>${xr(e.cost)}</strong></div>
          <div><span>投資範圍</span><strong>${(t==null?void 0:t.targetName)??"目前街區"}</strong></div>
          <div><span>學習焦點</span><strong>${e.learningFocus}</strong></div>
        </div>

        <div class="policy-detail-grid">
          <section>
            <h2>這項政策在科學上做了什麼？</h2>
            <p>${e.scienceNote}</p>
            <h2>為什麼會影響數值？</h2>
            <ul>
              ${e.effectExplanation.map(r=>`<li>${r}</li>`).join("")}
            </ul>
          </section>
          <section>
            <h2>投資後預估變化</h2>
            <div class="delta-board">
              ${t?wt("預算",t.deltas.budget,!1):""}
              ${t?wt("熱風險",t.deltas.heatRisk,!0):""}
              ${t?wt("洪水風險",t.deltas.floodRisk,!0):""}
              ${t?wt("空氣風險",t.deltas.airQualityRisk,!0):""}
              ${t?wt("公共健康",t.deltas.publicHealth,!1):""}
              ${t?wt("公平性",t.deltas.equity,!1):""}
              ${t?wt("SDGs",t.deltas.sdgScore,!1):""}
            </div>
            <div class="classroom-prompt">
              <span>課堂討論</span>
              <p>${e.classroomPrompt}</p>
            </div>
          </section>
        </div>

        <div class="policy-confirm-row">
          <p>${n??`確認後會花費 ${xr(e.cost)}，本回合政策額度會減少 1。`}</p>
          <button class="primary-btn large" type="button" data-confirm-policy="${e.id}" ${s?"":"disabled"}>
            確認投資
          </button>
        </div>
      </article>
    </section>
  `}function Sv(i){const e=i.evidenceLog,t={climate:"氣候訊號",district:"街區科學量",policy:"指標變化"};return`
    <section class="modal-scrim">
      <article class="guide-card evidence-card">
        <button class="close-btn" type="button" aria-label="關閉證據抽屜" data-close-evidence>x</button>
        <span>CER 證據抽屜</span>
        <h1>你的科學證據（${e.length} 筆）</h1>
        <p>每進入新的一年，系統會自動記錄關鍵科學量與資料來源。任務結束時，用這些證據完成你的主張（Claim）—證據（Evidence）—推理（Reasoning）論證。</p>
        ${e.length===0?'<p class="science-note">還沒有證據。啟動任務並推進年度後，證據會自動出現在這裡。</p>':`<div class="evidence-list">
                ${e.map(n=>`
                      <div class="evidence-entry ${n.kind}">
                        <small>${n.year} 年 · ${t[n.kind]}</small>
                        <strong>${ms(n.label)}</strong>
                        <p>${ms(n.value)}</p>
                        <em>來源：${ms(n.source)}</em>
                      </div>
                    `).join("")}
              </div>`}
        <p class="science-note">
          提示：好的 Reasoning 會說明「為什麼這個證據支持你的主張」——例如用 UHI ΔT 的°C 變化解釋為何先在市中心種樹，而不是只說「數字變好了」。
        </p>
      </article>
    </section>
  `}function bv(i){const e=i.mission;return`
    <section class="modal-scrim">
      <article class="guide-card">
        <button class="close-btn" type="button" aria-label="關閉任務教材" data-close-guide>x</button>
        <span>任務教材</span>
        <h1>${e.title}</h1>
        <p>${e.stakes}</p>
        <div class="guide-grid">
          ${e.objectives.map(t=>`
                <div class="guide-tile ${t.passed?"passed":""}">
                  <strong>${t.label}</strong>
                  <p>${t.helper}</p>
                  <small>目前 ${oo(t)}</small>
                </div>
              `).join("")}
        </div>
        <p class="science-note">
          遊戲重點：政策不是魔法按鈕。每個數值都來自暴露、脆弱度、可近性與基礎設施的關係。學生要練習先提出證據，再做取捨。
        </p>
      </article>
    </section>
  `}function Ev(i){const e=i.currentChallenge;return`
    <section class="modal-scrim">
      <article class="guide-card">
        <button class="close-btn" type="button" aria-label="關閉事件解析" data-close-guide>x</button>
        <span>事件解析</span>
        <h1>${e.title}</h1>
        <p>${e.body}</p>
        <p class="science-note">${e.scienceNote}</p>
        <div class="delta-board">
          ${Object.entries(e.pressure).map(([t,n])=>wt(Y_(t),n,j_(t))).join("")}
        </div>
      </article>
    </section>
  `}function Tv(i,e){return`
    <section class="modal-scrim">
      <article class="guide-card district-guide-card">
        <button class="close-btn" type="button" aria-label="關閉街區詳情" data-close-guide>x</button>
        <span>街區詳情</span>
        <h1>${e.name}</h1>
        <div class="district-grid expanded">
          ${Fi("熱暴露",e.heatExposure,!1)}
          ${Fi("淹水暴露",e.floodExposure,!1)}
          ${Fi("空污暴露",e.airPollution,!1)}
          ${Fi("健康",e.healthIndex,!0)}
          ${Fi("公平",e.equityIndex,!0)}
          ${Fi("韌性",e.resilienceIndex,!0)}
        </div>
        <div class="district-tabs expanded">
          ${i.districts.map(t=>iv(t,i.selectedDistrictId)).join("")}
        </div>
      </article>
    </section>
  `}function wv(i){return i?`
    <section class="modal-scrim">
      <article class="guide-card">
        <button class="close-btn" type="button" aria-label="關閉年度結算" data-close-guide>x</button>
        <span>年度結算</span>
        <h1>${i.year}: ${i.title}</h1>
        <p>${i.summary}</p>
        <p class="science-note">科學解析：${i.scienceNote}</p>
        <div class="delta-board">
          ${wt("熱風險",i.deltas.heatRisk??0,!0)}
          ${wt("公共健康",i.deltas.publicHealth??0,!1)}
          ${wt("公平性",i.deltas.equity??0,!1)}
          ${wt("SDGs",i.deltas.sdgScore??0,!1)}
          ${wt("預算",i.deltas.budget??0,!1)}
        </div>
      </article>
    </section>
  `:""}const Av=[{id:"none",label:"一般"},{id:"heat",label:"熱暴露"},{id:"flood",label:"淹水"},{id:"air",label:"空污"},{id:"uhi",label:"UHI °C"},{id:"runoff",label:"逕流"}];function Cv(i,e){i.className="hud-root";let t,n,s=!1,r=!1;i.addEventListener("click",a=>{const l=a.target,c=l.closest("[data-policy]"),u=l.closest("[data-district]"),h=l.closest("[data-open-guide]"),d=l.closest("[data-confirm-policy]");if(l.closest("[data-open-policy-board]")){s=!0,o();return}if(l.closest("[data-close-policy-board]")){s=!1,o();return}if(l.closest("[data-restart-game]")){e.onRestartGame();return}const f=l.closest("[data-mission]");if((f==null?void 0:f.dataset.mission)!==void 0){e.onSelectMission(Number(f.dataset.mission));return}if(l.closest("[data-pick-mission]")){e.onBackToMissionSelect();return}const g=l.closest("[data-layer]");if(g!=null&&g.dataset.layer){e.onSelectDataLayer(g.dataset.layer);return}const v=l.closest("[data-scenario]");if(v!=null&&v.dataset.scenario){e.onSelectScenario(v.dataset.scenario);return}if(l.closest("[data-open-evidence]")){r=!0,o();return}if(l.closest("[data-close-evidence]")){r=!1,o();return}if(l.closest("[data-close-policy]")){t=void 0,o();return}if(l.closest("[data-close-guide]")){n=void 0,o();return}if(l.closest("[data-open-data-guide]")){e.onOpenDataTutorial();return}if(l.closest("[data-close-data-guide]")){e.onCloseDataTutorial();return}if(l.closest("[data-reset-mission]")){t=void 0,n=void 0,s=!1,e.onResetMission();return}if(l.closest("[data-start-mission]")){e.onStartMission();return}if(d!=null&&d.dataset.confirmPolicy){t=void 0,e.onApplyPolicy(d.dataset.confirmPolicy);return}if(c!=null&&c.dataset.policy){t=c.dataset.policy,o();return}if(Rv(h==null?void 0:h.dataset.openGuide)){n=h.dataset.openGuide,o();return}if(u!=null&&u.dataset.district){e.onSelectDistrict(u.dataset.district);return}if(l.closest("[data-advance]")){e.onAdvanceYear();return}if(l.closest("[data-toggle-audio]")){e.onToggleAudio();return}l.closest("[data-live-data]")&&e.onLoadLiveData()});const o=()=>{const a=e.getState(),l=a.districts.find(v=>v.id===a.selectedDistrictId)??a.districts[0],c=t?Xa.find(v=>v.id===t):void 0,u=e.isYearProcessing(),h=e.getDataLoadStatus(),d=e.getDataLoadError(),f=e.getDataSourceStatuses(),g=e.isDataTutorialOpen();i.innerHTML=`
      <section class="top-hud" aria-label="城市狀態">
        <div class="brand-lockup">
          <span class="brand-mark"></span>
          <div>
            <strong>${a.cityName}</strong>
            <small>${a.year} 年 / ${a.mission.chapter} · 第 ${Math.min(a.turn,a.mission.turnLimit)} 回合${a.mission.turnLimit>100?"（無上限）":`，共 ${a.mission.turnLimit} 回合`}</small>
          </div>
        </div>
        <div class="metric-strip">
          ${Oi("預算",a.budget,"百萬",a.budget<20?"danger":"good")}
          ${Oi("SDGs",a.sdgScore,"",a.sdgScore>=70?"good":"warn")}
          ${Oi("熱風險",a.heatRisk,"",gs(a.heatRisk))}
          ${Oi("洪水",a.floodRisk,"",gs(a.floodRisk))}
          ${Oi("空氣",a.airQualityRisk,"",gs(a.airQualityRisk))}
          ${Oi("健康",a.publicHealth,"",lo(a.publicHealth))}
        </div>
      </section>

      <section class="layer-bar" aria-label="科學資料圖層">
        <span>圖層</span>
        ${Av.map(v=>`<button type="button" class="layer-btn ${e.getDataLayer()===v.id?"active":""}" data-layer="${v.id}">${v.label}</button>`).join("")}
        <button type="button" class="layer-btn evidence ${a.evidenceLog.length>0?"has-evidence":""}" data-open-evidence>
          證據抽屜（${a.evidenceLog.length}）
        </button>
        <button type="button" class="layer-btn restart" data-restart-game>重新開始</button>
      </section>

      ${K_(a)}
      ${Z_(a)}
      ${J_(a,l)}
      ${Q_(a,e.isAudioEnabled(),u)}
      ${u?_v(a):""}
      ${a.mission.status==="briefing"?xv(a,h,d):""}
      ${g?av(a,h,f,d):""}
      ${a.mission.status==="won"||a.mission.status==="lost"?yv(a):""}
      ${s?vv(a):""}
      ${c?Mv(a,c):""}
      ${n==="mission"?bv(a):""}
      ${n==="challenge"?Ev(a):""}
      ${n==="district"?Tv(a,l):""}
      ${n==="resolution"?wv(a.lastResolution):""}
      ${r?Sv(a):""}
    `};return{render:o}}function Rv(i){return i==="mission"||i==="challenge"||i==="district"||i==="resolution"}const Pv={BASE_URL:"./",DEV:!1,MODE:"production",PROD:!0,SSR:!1},co="climate-resilience-lab/save/v1";function Lv(i){try{window.localStorage.setItem(co,JSON.stringify(i))}catch{}}function Dv(){var i,e;try{const t=window.localStorage.getItem(co);if(!t)return;const n=JSON.parse(t);return typeof n.seed!="number"||!n.scenario||!Array.isArray(n.evidenceLog)||!n.mode||typeof n.missionIndex!="number"||!Array.isArray((e=(i=n.districts)==null?void 0:i[0])==null?void 0:e.cells)?void 0:n}catch{return}}function Iv(){try{window.localStorage.removeItem(co)}catch{}}const _u=document.querySelector("#game-canvas"),vu=document.querySelector("#hud-root");if(!_u||!vu)throw new Error("Missing game canvas or HUD root.");const Uv=Dv();let Qe=Uv??ui(Wa()),Tt=!1,Ta="none",ki=!1,ai="idle",yr,zn=!1,_s=[];const Nv=5e3,ht=wu(),vs=W_(_u,Qe,{onSelectDistrict:i=>xu(i)}),oi=Cv(vu,{getState:()=>Qe,onStartMission:()=>{if(ai!=="ready"){dc();return}zn=!1;const i=Uh(Qe);Fv(i.currentChallenge.soundCue),ht.startAmbience(i.currentChallenge.soundCue),ht.playEvent(i.currentChallenge.soundCue),Zt(i)},onApplyPolicy:i=>{if(ki)return;const e=Qe.appliedPolicies.length,t=Nh(Qe,i);Tt&&t.appliedPolicies.length>e?ht.playPolicy():Tt&&ht.playSelect(),Zt(t)},onAdvanceYear:()=>{if(ki)return;const i=Qe,e=Oh(i);if(e===i||i.mission.status!=="active"){Zt(e);return}ki=!0,vs.playYearTransition(i),Bv(i),oi.render(),window.setTimeout(()=>{ki=!1,Tt&&e.lastResolution&&ht.startAmbience(e.currentChallenge.soundCue),Tt&&i.mission.status!==e.mission.status&&(e.mission.status==="won"&&ht.playSuccess(),e.mission.status==="lost"&&ht.playFailure()),Zt(e)},Nv)},onSelectDistrict:i=>xu(i),onResetMission:()=>fc(),isAudioEnabled:()=>Tt,isYearProcessing:()=>ki,onToggleAudio:()=>Ov(),onLoadLiveData:()=>{Tt&&ht.playSelect(),dc()},getDataLoadStatus:()=>ai,getDataLoadError:()=>yr,getDataSourceStatuses:()=>_s,isDataTutorialOpen:()=>zn,onOpenDataTutorial:()=>{zn=!0,oi.render()},onCloseDataTutorial:()=>{zn=!1,oi.render()},getDataLayer:()=>Ta,onSelectDataLayer:i=>{Ta=i,Tt&&ht.playSelect(),vs.setDataLayer(i),oi.render()},onSelectScenario:i=>{Qe.mission.status==="briefing"&&(Tt&&ht.playSelect(),Zt({...Qe,scenario:i}))},onRestartGame:()=>{window.confirm("確定要重新開始嗎？目前的城市進度與存檔將被清除。")&&(Ta="none",vs.setDataLayer("none"),fc())},onSelectMission:i=>{Qe.mission.status==="briefing"&&(Tt&&ht.playSelect(),Zt({...Qe,missionIndex:i,mission:go(Qe.seed,i)}))},onBackToMissionSelect:()=>{Tt&&ht.playSelect();const i=ui(Wa(void 0,{seed:Qe.seed,scenario:Qe.scenario}));Zt({...i,missionIndex:Qe.missionIndex,mission:go(i.seed,Qe.missionIndex)})}});oi.render();vs.start();async function dc(){if(ai!=="loading"){ai="loading",yr=void 0,zn=!1,_s=[],Zt({...Qe,eventLog:["正在載入 Open-Meteo（含空氣品質）/ NASA POWER 公開資料與官方人口統計，並整理成任務起始數據。",...Qe.eventLog].slice(0,10)});try{const i=await ph(Qe,{useNetwork:!0,openAqApiKey:zv("VITE_OPENAQ_API_KEY")});_s=i.sources,ai="ready",zn=!0,Zt({...Fh(Qe,i.signals),eventLog:["資料來源已整理，請先閱讀資料科普與來源狀態再開始任務。",...Qe.eventLog].slice(0,10)})}catch(i){ai="error",yr=String(i),zn=!1,_s=[],Zt({...Qe,eventLog:[`公開資料載入失敗，請稍後重試。原因：${String(i)}`,...Qe.eventLog].slice(0,10)})}}}function xu(i){var e;Tt&&ht.playSelect(),Zt({...Qe,selectedDistrictId:i,eventLog:[`已選擇 ${((e=Qe.districts.find(t=>t.id===i))==null?void 0:e.name)??i}。`,...Qe.eventLog].slice(0,10)})}function fc(){Iv(),ki=!1,ai="idle",yr=void 0,zn=!1,_s=[];const i=ui(Wa());Tt&&(ht.startAmbience(i.currentChallenge.soundCue),ht.playEvent("civic")),Zt(i)}function Ov(){Tt=!Tt,ht.setMuted(!Tt),Tt&&(ht.startAmbience(Qe.currentChallenge.soundCue),ht.playEvent("civic")),oi.render()}function Fv(i){Tt=!0,ht.setMuted(!1),ht.startAmbience(i)}function Zt(i){Qe=i,Lv(Qe),vs.update(Qe),oi.render()}function Bv(i){if(!Tt)return;const e=i.appliedPolicies.filter(n=>n.turn===i.turn).slice().reverse();e.forEach((n,s)=>{window.setTimeout(()=>ht.playPolicy(),260+s*720)});const t=Math.max(1200,680+e.length*720);window.setTimeout(()=>ht.playEvent(i.currentChallenge.soundCue),t)}function zv(i){return Pv[i]}

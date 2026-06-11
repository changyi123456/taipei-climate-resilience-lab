var th=Object.defineProperty;var eh=(i,t,e)=>t in i?th(i,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):i[t]=e;var ct=(i,t,e)=>eh(i,typeof t!="symbol"?t+"":t,e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function e(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(s){if(s.ep)return;s.ep=!0;const r=e(s);fetch(s.href,r)}})();function nh(){return new sh}const ih={heat:{chord:[55,110,165,220],scale:[330,370,440,495,587],filterBase:320,filterSweep:180,noteIntervalMs:2600,pulse:!0,padGain:.05},rain:{chord:[73.4,110,146.8,220],scale:[293.7,349.2,392,440,523.3],filterBase:560,filterSweep:260,noteIntervalMs:1900,pulse:!1,padGain:.055},air:{chord:[65.4,98,130.8,196],scale:[261.6,294,392,440,588],filterBase:300,filterSweep:120,noteIntervalMs:3e3,pulse:!1,padGain:.05},energy:{chord:[82.4,123.5,164.8,247],scale:[329.6,412,494,659,824],filterBase:720,filterSweep:320,noteIntervalMs:1500,pulse:!0,padGain:.048},civic:{chord:[65.4,98,130.8,164.8],scale:[261.6,327.5,392,436,523.3],filterBase:480,filterSweep:200,noteIntervalMs:2300,pulse:!1,padGain:.052}};class sh{constructor(){ct(this,"context");ct(this,"master");ct(this,"reverbSend");ct(this,"musicGain");ct(this,"sfxGain");ct(this,"ambienceBedGain");ct(this,"padVoices",[]);ct(this,"padLfo");ct(this,"currentTheme");ct(this,"melodyTimer",0);ct(this,"pulseTimer",0);ct(this,"muted",!0);ct(this,"sampleSpecs",{});ct(this,"sampleBuffers",new Map);ct(this,"ambienceBedSource");ct(this,"samplesReady");this.samplesReady=this.loadManifest()}async loadManifest(){try{const t=await fetch("/audio/manifest.json",{cache:"no-cache"});if(!t.ok)return;const e=await t.json();this.sampleSpecs=(e==null?void 0:e.samples)??{}}catch{}}async getSample(t){if(this.sampleBuffers.has(t))return this.sampleBuffers.get(t);const e=this.sampleSpecs[t];if(e)try{const n=await fetch(`/audio/${e.file}`,{cache:"force-cache"});if(!n.ok)return;const s=await n.arrayBuffer(),r=await this.ensureContext().decodeAudioData(s);return this.sampleBuffers.set(t,r),r}catch{return}}async playSample(t){var o;await this.samplesReady;const e=await this.getSample(t);if(!e)return!1;const n=this.ensureContext(),s=n.createBufferSource(),r=n.createGain();return r.gain.value=((o=this.sampleSpecs[t])==null?void 0:o.gain)??.6,s.buffer=e,s.connect(r),r.connect(this.sfxGain),r.connect(this.reverbSend),s.start(),!0}startAmbience(t){const e=this.ensureContext();if(this.resume(),this.startCityBed(),this.currentTheme===t&&this.padVoices.length>0)return;this.stopPadAndMelody(),this.currentTheme=t;const n=ih[t],s=e.createOscillator(),r=e.createGain();s.frequency.value=.05+Math.random()*.03,r.gain.value=n.filterSweep,s.connect(r),s.start(),this.padLfo=s,this.padVoices=n.chord.map((a,l)=>{const c=e.createOscillator(),u=e.createBiquadFilter(),h=e.createGain();c.type=l===0?"sine":l===n.chord.length-1?"triangle":"sawtooth",c.frequency.value=a,c.detune.value=(Math.random()-.5)*8,u.type="lowpass",u.frequency.value=n.filterBase,u.Q.value=.8,r.connect(u.frequency);const d=n.padGain/(1+l*.35);return h.gain.setValueAtTime(0,e.currentTime),h.gain.linearRampToValueAtTime(d,e.currentTime+2.2),c.connect(u),u.connect(h),h.connect(this.musicGain),h.connect(this.reverbSend),c.start(),{osc:c,gain:h,filter:u}});const o=()=>{this.currentTheme===t&&(this.playMelodyNote(n),this.melodyTimer=window.setTimeout(o,n.noteIntervalMs*(.7+Math.random()*.6)))};if(this.melodyTimer=window.setTimeout(o,1200),n.pulse){const a=()=>{this.currentTheme===t&&(this.playTone(n.chord[0],n.chord[0],.5,.035,"sine"),this.pulseTimer=window.setTimeout(a,1400))};this.pulseTimer=window.setTimeout(a,900)}}async startCityBed(){var r;if(this.ambienceBedSource)return;await this.samplesReady;const t=await this.getSample("cityAmbience");if(!t||this.ambienceBedSource)return;const e=this.ensureContext(),n=e.createBufferSource();n.buffer=t,n.loop=!0,n.connect(this.ambienceBedGain);const s=((r=this.sampleSpecs.cityAmbience)==null?void 0:r.gain)??.32;this.ambienceBedGain.gain.setValueAtTime(0,e.currentTime),this.ambienceBedGain.gain.linearRampToValueAtTime(s,e.currentTime+3),n.start(),this.ambienceBedSource=n}playMelodyNote(t){const e=this.ensureContext(),n=t.scale[Math.floor(Math.random()*t.scale.length)],s=e.createOscillator(),r=e.createGain(),o=e.currentTime;s.type="triangle",s.frequency.value=n,r.gain.setValueAtTime(1e-4,o),r.gain.exponentialRampToValueAtTime(.045,o+.08),r.gain.exponentialRampToValueAtTime(1e-4,o+1.8),s.connect(r),r.connect(this.musicGain),r.connect(this.reverbSend),s.start(o),s.stop(o+1.85)}playEvent(t){this.resume(),this.playSample(t).then(e=>{e||this.synthEvent(t)})}synthEvent(t){if(t==="heat"){this.playTone(140,70,1.1,.085,"sawtooth",!0),this.playNoise(.9,820,.05,!0),window.setTimeout(()=>this.playTone(96,60,.9,.06,"triangle"),90);return}if(t==="rain"){this.playNoise(1.3,1400,.085,!0),this.playNoise(.6,240,.06,!0),this.playTone(70,48,1,.05,"sine");return}if(t==="air"){this.playNoise(1.4,380,.06,!0),this.playTone(84,74,1.1,.05,"sine",!0);return}if(t==="energy"){[180,240,300,360].forEach((e,n)=>window.setTimeout(()=>this.playTone(e,e*1.4,.16,.055,"square",!0),n*110));return}this.playTone(294,392,.4,.06,"sine",!0),window.setTimeout(()=>this.playTone(392,523,.5,.05,"triangle",!0),150)}playPolicy(){this.resume(),this.playSample("spend").then(t=>{t||this.synthCash()}),this.playSample("policy").then(t=>{t||([523,659,784,1047].forEach((e,n)=>window.setTimeout(()=>this.playTone(e,e,.2,.05,"triangle",!0),n*70)),window.setTimeout(()=>this.playTone(392,588,.3,.045,"sine",!0),300))})}synthCash(){this.playTone(1318,1318,.08,.06,"square",!0),window.setTimeout(()=>this.playTone(1568,1568,.1,.05,"square",!0),70),window.setTimeout(()=>this.playNoise(.18,3200,.04,!0),120),window.setTimeout(()=>this.playNoise(.14,2400,.03,!0),200)}playSelect(){this.resume(),this.playSample("select").then(t=>{t||this.playTone(560,660,.1,.03,"sine")})}playSuccess(){this.resume(),this.playSample("success").then(t=>{t||([392,494,587,784].forEach((e,n)=>window.setTimeout(()=>this.playTone(e,e,.35,.06,"triangle",!0),n*120)),window.setTimeout(()=>this.playTone(1047,1047,.6,.05,"sine",!0),520))})}playFailure(){this.resume(),this.playSample("failure").then(t=>{t||([330,277,233,165].forEach((e,n)=>window.setTimeout(()=>this.playTone(e,e*.9,.4,.06,"sawtooth",!0),n*150)),window.setTimeout(()=>this.playTone(110,70,1,.07,"sine",!0),600))})}setMuted(t){this.muted=t;const e=this.ensureContext(),n=t?0:.32;this.master.gain.cancelScheduledValues(e.currentTime),this.master.gain.setTargetAtTime(n,e.currentTime,.1),t||this.resume()}ensureContext(){if(this.context)return this.context;const t=window.AudioContext??window.webkitAudioContext;if(!t)throw new Error("此瀏覽器不支援 Web Audio。");const e=new t;this.context=e;const n=e.createGain();n.gain.value=this.muted?0:.32,n.connect(e.destination),this.master=n;const s=e.createConvolver();s.buffer=this.buildImpulseResponse(e,2.6,2.4);const r=e.createGain();r.gain.value=.32;const o=e.createGain();o.gain.value=1,o.connect(s),s.connect(r),r.connect(n),this.reverbSend=o;const a=e.createGain();a.gain.value=.6,a.connect(n),this.musicGain=a;const l=e.createGain();l.gain.value=.9,l.connect(n),this.sfxGain=l;const c=e.createGain();return c.gain.value=0,c.connect(n),this.ambienceBedGain=c,e}buildImpulseResponse(t,e,n){const s=t.sampleRate,r=Math.floor(s*e),o=t.createBuffer(2,r,s);for(let a=0;a<2;a+=1){const l=o.getChannelData(a);for(let c=0;c<r;c+=1)l[c]=(Math.random()*2-1)*Math.pow(1-c/r,n)}return o}resume(){const t=this.ensureContext();t.state==="suspended"&&t.resume()}stopPadAndMelody(){if(!this.context)return;const t=this.context.currentTime;window.clearTimeout(this.melodyTimer),window.clearTimeout(this.pulseTimer);for(const e of this.padVoices)e.gain.gain.cancelScheduledValues(t),e.gain.gain.setTargetAtTime(0,t,.4),e.osc.stop(t+1.2);this.padVoices=[],this.padLfo&&(this.padLfo.stop(t+1.2),this.padLfo=void 0)}playTone(t,e,n,s,r,o=!1){const a=this.ensureContext(),l=a.createOscillator(),c=a.createGain(),u=a.currentTime;l.type=r,l.frequency.setValueAtTime(t,u),l.frequency.exponentialRampToValueAtTime(Math.max(20,e),u+n),c.gain.setValueAtTime(1e-4,u),c.gain.exponentialRampToValueAtTime(s,u+.025),c.gain.exponentialRampToValueAtTime(1e-4,u+n),l.connect(c),c.connect(this.master),o&&c.connect(this.reverbSend),l.start(u),l.stop(u+n+.02)}playNoise(t,e,n,s=!1){const r=this.ensureContext(),o=r.createBuffer(1,Math.floor(r.sampleRate*t),r.sampleRate),a=o.getChannelData(0);for(let d=0;d<a.length;d+=1)a[d]=Math.random()*2-1;const l=r.createBufferSource(),c=r.createBiquadFilter(),u=r.createGain(),h=r.currentTime;l.buffer=o,c.type="bandpass",c.frequency.value=e,c.Q.value=.9,u.gain.setValueAtTime(1e-4,h),u.gain.exponentialRampToValueAtTime(n,h+.04),u.gain.exponentialRampToValueAtTime(1e-4,h+t),l.connect(c),c.connect(u),u.connect(this.master),s&&u.connect(this.reverbSend),l.start(h),l.stop(h+t+.02)}}function Jr(i){let t=i|0;return t=t+2654435769|0,t=Math.imul(t^t>>>16,569420461),t=Math.imul(t^t>>>15,1935289751),(t^t>>>15)>>>0}function Wc(i,...t){let e=Jr(i);for(const n of t)e=Jr(e^Jr(n));return e/4294967296}function rh(i,t,...e){const n=Math.floor(Wc(t,...e)*i.length);return i[Math.min(i.length-1,n)]}function ah(){return Math.floor(Math.random()*4294967295)>>>0}function mo(i){return Wc(10368889,i)}const vn=16,Qe=4,Ka={pavement:{type:"pavement",label:"硬鋪面",color:5068382,imperviousness:1,canopy:0,solar:0,scienceNote:"柏油與水泥吸熱儲熱、不透水，是熱島與逕流的主因。"},building:{type:"building",label:"建築",color:3820118,imperviousness:1,canopy:0,solar:0,scienceNote:"屋頂與牆面同樣吸熱不透水，但可改造為太陽能或綠屋頂。"},green:{type:"green",label:"樹冠綠地",color:3050319,buildCost:3,imperviousness:.05,canopy:1,solar:0,scienceNote:"樹蔭減少地表吸熱、蒸散帶走熱量（Ziter et al. 2019：樹冠 +10% ≈ −2.5°C）。"},permeable:{type:"permeable",label:"透水鋪面",color:8232042,buildCost:4,imperviousness:.2,canopy:.1,solar:0,scienceNote:"讓雨水滲入或暫存，降低逕流係數（合理化公式 C ≈ 0.05+0.85×不透水率）。"},water:{type:"water",label:"滯洪水體",color:2981800,buildCost:5,imperviousness:0,canopy:0,solar:0,scienceNote:"滯洪池與濕地暫存洪峰水量，亦有局部蒸發降溫效果。"},solar:{type:"solar",label:"太陽能",color:9072585,buildCost:4,imperviousness:.9,canopy:0,solar:1,scienceNote:"屋頂光電提高能源安全並降低電網尖峰的化石燃料依賴。"},shelter:{type:"shelter",label:"避難設施",color:13209917,imperviousness:.9,canopy:0,solar:0,scienceNote:"冷房避難點不改變氣溫（Hazard），但降低脆弱族群的熱暴露（Vulnerability）。"}};function oh(i){let t=0,e=0,n=0,s=0,r=0;for(const a of i){const l=Ka[a];t+=l.imperviousness,e+=l.canopy,n+=l.solar,a==="water"&&(s+=1),a==="shelter"&&(r+=1)}const o=Math.max(1,i.length);return{imperviousness:t/o,canopyCover:e/o,solarCoverage:n/o,floodDefenseBonus:s*.04,coolingAccessBonus:r*.06}}function lh(i,t){const e=[],n=Math.round(i.canopyCover*vn),s=Math.round(i.solarCoverage*vn*.8),r=i.coolingAccess>.38?1:0,o=Math.max(0,Math.round((1-i.imperviousness)*vn)-n),a=Math.min(vn-n-s-r-o,6+Math.floor(ch(i.id,t)*3));for(let l=0;l<n;l+=1)e.push("green");for(let l=0;l<o;l+=1)e.push("permeable");for(let l=0;l<s;l+=1)e.push("solar");for(let l=0;l<r;l+=1)e.push("shelter");for(let l=0;l<Math.max(0,a);l+=1)e.push("building");for(;e.length<vn;)e.push("pavement");e.length=vn;for(let l=e.length-1;l>0;l-=1){const c=Math.floor(mo(t%9973+l*37+i.id.length*11)*(l+1));[e[l],e[c]]=[e[c],e[l]]}return e}function ch(i,t){let e=t;for(let n=0;n<i.length;n+=1)e=e*31+i.charCodeAt(n)|0;return mo(Math.abs(e))}function uh(i,t,e,n){const s=[...i],r=Math.max(1,Math.ceil(Math.abs(e)*vn)),o=(a,l,c)=>{let u=c;const h=Math.floor(mo(n+c*13)*vn);for(let d=0;d<vn&&u>0;d+=1){const p=(h+d)%vn;a.includes(s[p])&&(s[p]=l,u-=1)}};return t==="canopyCover"&&e>0?o(["pavement","permeable"],"green",r):t==="imperviousness"&&e<0?o(["pavement"],"permeable",r):t==="solarCoverage"&&e>0&&o(["building","pavement"],"solar",r),s}const Za=[{id:"ssp126",name:"SSP1-2.6 永續轉型",shortName:"SSP1-2.6",description:"全球快速減排、本世紀中接近淨零。升溫趨緩，但已鎖定的暖化仍需要調適。",warmingPerYearC:.02,heatwaveDaysPerYear:.25,tropicalNightsPerYear:.45,monthlyPrecipPerYearMm:.7,heavyRainDaysPerYear:.08,precipAnomalyPerYear:.005},{id:"ssp245",name:"SSP2-4.5 中間路線",shortName:"SSP2-4.5",description:"全球延續目前政策力道。升溫與極端事件持續增加，是常用的「中間」參考情境。",warmingPerYearC:.027,heatwaveDaysPerYear:.4,tropicalNightsPerYear:.7,monthlyPrecipPerYearMm:1.2,heavyRainDaysPerYear:.15,precipAnomalyPerYear:.01},{id:"ssp585",name:"SSP5-8.5 高排放",shortName:"SSP5-8.5",description:"化石燃料密集發展。升溫最快、極端事件最劇烈，常作為高風險壓力測試情境。",warmingPerYearC:.043,heatwaveDaysPerYear:.7,tropicalNightsPerYear:1.1,monthlyPrecipPerYearMm:1.9,heavyRainDaysPerYear:.24,precipAnomalyPerYear:.016}],hh="ssp245";function dh(i){return Za.find(t=>t.id===i)??Za[1]}function re(i,t=0,e=100){return Math.min(e,Math.max(t,i))}function Ja(i){return re(i,0,1)}function Zt(i,t=0){const e=10**t;return Math.round(i*e)/e}function bn(i,t,e){const n=i.reduce((s,r)=>s+e(r),0);return n<=0?0:i.reduce((s,r)=>s+t(r)*e(r),0)/n}const fh=new Set(["urban-tree-canopy","cooling-shelters","wetland-buffer","citizen-science-network"]),ph=[{name:"標準熱浪警戒",briefingHook:"中央氣象單位發布連續高溫警戒，市府要求在四回合內完成降溫、健康與公平三項調適目標。",heatTarget:55,healthTarget:66,equityTarget:58,budgetTarget:10,coolingActionsTarget:2,policyLimitPerTurn:2}];function Xc(i){const t=ph[0];return{id:"heatwave-watch",chapter:"第 1 章",title:`熱浪警戒：${t.name}`,briefing:`${t.briefingHook} 每回合最多只能審議 ${t.policyLimitPerTurn} 項政策，請先閱讀政策說明，再決定是否花費預算。`,stakes:"你扮演城市韌性小組，必須在有限預算與有限行政量能下保護居民。成功不是把所有政策買完，而是用證據判斷哪個區域最需要哪種介入。",turnLimit:4,policyLimitPerTurn:t.policyLimitPerTurn,status:"briefing",objectives:_h(t).map(e=>({...e,current:0,passed:!1}))}}const mh=[{index:0,title:"熱浪警戒",blurb:"高溫與熱夜衝擊健康與公平，用樹冠、避難網絡與海綿街廓降溫。"},{index:1,title:"颱風洪峰",blurb:"短延時強降雨考驗排水。觀察逕流圖層，布置透水與滯洪設施。"},{index:2,title:"靜風空污",blurb:"靜風期 PM2.5 累積。管制排放、綠運輸與綠帶多管齊下。"},{index:3,title:"能源轉型",blurb:"尖峰用電逼近極限。鋪設太陽能、強化綠運輸，兼顧健康與減排。"}],Vo=[{id:"heatwave-watch",chapter:"第 1 章",title:"熱浪警戒",briefing:"",stakes:"",objectives:[]},{id:"typhoon-flood",chapter:"第 2 章",title:"颱風洪峰：海綿城市考驗",briefing:"颱風季來臨，外圍環流的短延時強降雨將考驗排水系統。河岸與海港低窪區的逕流係數是關鍵——觀察「逕流」圖層，把透水設施放在最需要的地方。",stakes:"上一章的降溫投資仍然有效，但這一章雨水不會等你。每回合最多 2 項政策，也可直接在地格上建造透水鋪面與滯洪水體。",objectives:[{id:"lower-flood",label:"洪水風險 <= 56",metric:"floodRisk",comparator:"<=",target:56,helper:"洪水風險由極端降雨（Hazard）×逕流（地表）×防洪設施（Vulnerability）組成。"},{id:"protect-health-2",label:"公共健康 >= 64",metric:"publicHealth",comparator:">=",target:64,helper:"淹水會直接衝擊健康（傷亡、傳染病、心理壓力）。"},{id:"keep-trust",label:"公眾信任 >= 58",metric:"publicTrust",comparator:">=",target:58,helper:"防災溝通與透明決策維持市民信任。"},{id:"keep-budget-2",label:"剩餘預算 >= 10",metric:"budget",comparator:">=",target:10,unit:" 百萬",helper:"颱風季後還需要修復預算。"}]},{id:"stagnant-smog",chapter:"第 3 章",title:"靜風空污：呼吸保衛戰",briefing:"秋冬靜風期讓 PM2.5 不易擴散，工業區與交通幹道周邊暴露上升。切換「空污」圖層找出熱點，用排放管制、綠運輸與綠帶吸附多管齊下。",stakes:"AQI 已對齊 EPA 官方類別——讓城市離開橘色（對敏感族群不健康）區間。",objectives:[{id:"lower-air",label:"空氣風險 <= 38",metric:"airQualityRisk",comparator:"<=",target:38,helper:"空氣風險由區域 AQI 基準與街區排放源組成。"},{id:"protect-health-3",label:"公共健康 >= 67",metric:"publicHealth",comparator:">=",target:67,helper:"PM2.5 與呼吸道、心血管疾病有明確的劑量反應關係。"},{id:"lower-emissions",label:"排放 <= 62",metric:"emissions",comparator:"<=",target:62,helper:"管制本地排放同時改善空品與碳排。"},{id:"keep-budget-3",label:"剩餘預算 >= 8",metric:"budget",comparator:">=",target:8,unit:" 百萬",helper:"保留下一章能源轉型的本錢。"}]},{id:"energy-transition",chapter:"第 4 章",title:"能源轉型：尖峰與淨零",briefing:"連年熱浪推升冷氣用電，電網逼近極限。鋪設太陽能（地格建造或政策）、強化綠運輸，在不犧牲健康的前提下完成能源轉型。",stakes:"最終章：調適與減緩必須同時成立。完成後城市進入自由沙盒。",objectives:[{id:"energy-secure",label:"能源安全 >= 68",metric:"energySecurity",comparator:">=",target:68,helper:"分散式太陽能降低尖峰時段的電網壓力。"},{id:"deep-cut",label:"排放 <= 52",metric:"emissions",comparator:"<=",target:52,helper:"淨零路徑需要運輸、產業、能源同時減排。"},{id:"protect-health-4",label:"公共健康 >= 68",metric:"publicHealth",comparator:">=",target:68,helper:"能源轉型不能以健康為代價。"},{id:"keep-trust-4",label:"公眾信任 >= 60",metric:"publicTrust",comparator:">=",target:60,helper:"轉型正義：讓市民理解並支持轉型的代價與效益。"}]}];function Wo(i,t){if(t<=0)return Xc();const e=Vo[Math.min(t,Vo.length-1)];return{id:e.id,chapter:e.chapter,title:e.title,briefing:e.briefing,stakes:e.stakes,turnLimit:4,policyLimitPerTurn:2,status:"briefing",objectives:e.objectives.map(n=>({...n,current:0,passed:!1}))}}function gh(i){if(i.mission.status!=="briefing")return i;const t={...i,mission:{...i.mission,status:"active"},eventLog:["任務開始：先觀察城市指標與選定街區，再查看政策詳情並確認投資。",...i.eventLog].slice(0,10)};return Is(t,{allowCompletion:!1})}function Is(i,t){const e=i.mission,n=e.objectives.map(u=>xh(i,u)),s=n.every(u=>u.passed),r=i.turn>e.turnLimit;let o=e.status,a=i.phase,l=e.debriefTitle,c=e.debriefBody;return n.length===0?{...i,mission:{...e,objectives:n}}:(t.allowCompletion&&o==="active"&&s?(o="won",a="complete",l=`副本「${e.title}」達成`,c="本副本目標全部達成！可以挑戰其他副本，比較不同災害需要的調適策略——降溫、防洪、空品與能源其實共用同一套科學框架。"):t.allowCompletion&&o==="active"&&r&&(o="lost",a="complete",l="任務未達標",c=Mh(n)),{...i,phase:a,mission:{...e,status:o,objectives:n,debriefTitle:l,debriefBody:c}})}function vh(i){return Math.max(0,i.mission.turnLimit-i.turn+1)}function _h(i){return[{id:"lower-heat",label:`熱風險 <= ${i.heatTarget}`,metric:"heatRisk",comparator:"<=",target:i.heatTarget,helper:"熱風險越高，代表高溫暴露、硬鋪面與降溫不足的壓力越大。"},{id:"protect-health",label:`公共健康 >= ${i.healthTarget}`,metric:"publicHealth",comparator:">=",target:i.healthTarget,helper:"公共健康受到熱暴露、淹水、空污與照護可近性的共同影響。"},{id:"protect-equity",label:`公平性 >= ${i.equityTarget}`,metric:"equity",comparator:">=",target:i.equityTarget,helper:"公平性代表弱勢族群能否同樣取得降溫、交通與資訊服務。"},{id:"heat-actions",label:`降溫介入 >= ${i.coolingActionsTarget}`,metric:"coolingInterventions",comparator:">=",target:i.coolingActionsTarget,helper:"至少完成兩項與熱保護有關的政策，避免只靠單一方案。"},{id:"keep-budget",label:`剩餘預算 >= ${i.budgetTarget}`,metric:"budget",comparator:">=",target:i.budgetTarget,unit:" 百萬",helper:"保留預算代表城市還能面對下一次災害或維護支出。"}]}function xh(i,t){const e=yh(i,t.metric),n=t.comparator===">="?e>=t.target:e<=t.target;return{...t,current:Zt(e,t.metric==="coolingInterventions"?0:1),passed:n}}function yh(i,t){return t==="budget"?i.budget:t==="turn"?i.turn:t==="coolingInterventions"?i.appliedPolicies.filter(e=>fh.has(e.policyId)).length:i[t]}function Mh(i){return`城市已經完成部分調適，但還沒有達成任務門檻。未達標項目：${i.filter(e=>!e.passed).map(e=>e.label).join("、")||"無"}。下次可以先閱讀政策詳情，找出哪些政策能直接處理熱暴露、健康或公平性。`}const Sh={latitude:25.033,longitude:121.5654},Je={meanTemperatureC:28.4,temperatureAnomalyC:1.4,heatwaveDaysPerSeason:18,tropicalNightsPerSeason:64,monthlyPrecipitationMm:265,precipitationAnomalyRatio:1.18,heavyRainDaysPerSeason:8,pm25UgM3:14.8,solarKwhM2Day:3.78,population:249e4,urbanPopulationRatio:.95},Xo=[{id:"heat-dome",title:"高壓熱穹頂",body:"副熱帶高壓盤據，夜間降溫不足。柏油與水泥白天吸熱、夜間釋熱，市中心與弱勢住宅區熱暴露快速升高。",scienceNote:"熱浪會讓人體散熱變困難，夜間高溫尤其危險，因為身體沒有恢復時間。樹蔭、冷房與低熱容量鋪面都能降低暴露。",soundCue:"heat",pressure:{heatRisk:8,publicHealth:-4,equity:-3}},{id:"typhoon-rainband",title:"颱風雨帶滯留",body:"外圍環流帶來短延時強降雨，河岸與低窪街區排水壓力升高。若不透水面比例高，雨水會更快形成地表逕流。",scienceNote:"強降雨風險不只看雨量，也看地表能不能吸收或暫存雨水。海綿街廓、濕地與滯洪空間可削減洪峰。",soundCue:"rain",pressure:{floodRisk:10,publicTrust:-3}},{id:"stagnant-air",title:"靜風空污累積",body:"風速偏弱讓污染物不易擴散，工業區與交通幹道周邊 PM2.5 暴露上升，呼吸道敏感族群受到影響。",scienceNote:"空氣污染濃度會受排放量與擴散條件影響。低風速、逆溫或高排放都會讓污染累積在近地面。",soundCue:"air",pressure:{airQualityRisk:8,publicHealth:-3}},{id:"energy-peak",title:"尖峰用電拉警報",body:"連續高溫推升冷氣用電，電網備轉容量下降。若供電以化石燃料補足，排放與空污可能同步上升。",scienceNote:"氣候調適與減緩會互相牽動。熱浪需要冷房保護健康，但若能源系統不低碳，降溫也可能增加排放。",soundCue:"energy",pressure:{energySecurity:-5,emissions:5}},{id:"budget-review",title:"市議會預算審查",body:"民眾要求市府解釋每項支出的證據基礎。資料透明與公民參與能提升信任，但缺乏說明會削弱支持度。",scienceNote:"永續政策需要科學證據，也需要社會溝通。學生可以練習把指標、模型假設與政策取捨說清楚。",soundCue:"civic",pressure:{publicTrust:-2,educationScore:4}}];function bh(i=1){return Eh().map(t=>({...t,cells:lh(t,i)}))}function Eh(){return[{id:"harbor",name:"海港低窪區",archetype:"coastal",population:32e4,elevationM:2.5,imperviousness:.76,canopyCover:.13,transitAccess:.58,solarCoverage:.16,floodDefense:.22,coolingAccess:.34,industryLoad:.47,heatExposure:62,floodExposure:74,airPollution:55,healthIndex:58,equityIndex:51,resilienceIndex:44},{id:"core",name:"市中心熱島區",archetype:"downtown",population:51e4,elevationM:8,imperviousness:.89,canopyCover:.08,transitAccess:.82,solarCoverage:.12,floodDefense:.28,coolingAccess:.42,industryLoad:.31,heatExposure:77,floodExposure:48,airPollution:50,healthIndex:61,equityIndex:56,resilienceIndex:49},{id:"riverbend",name:"河岸住宅區",archetype:"river",population:28e4,elevationM:4,imperviousness:.67,canopyCover:.21,transitAccess:.48,solarCoverage:.1,floodDefense:.18,coolingAccess:.31,industryLoad:.19,heatExposure:59,floodExposure:71,airPollution:41,healthIndex:64,equityIndex:58,resilienceIndex:46},{id:"industry",name:"產業排放區",archetype:"industrial",population:21e4,elevationM:6,imperviousness:.81,canopyCover:.07,transitAccess:.39,solarCoverage:.21,floodDefense:.25,coolingAccess:.24,industryLoad:.78,heatExposure:72,floodExposure:56,airPollution:78,healthIndex:49,equityIndex:47,resilienceIndex:39},{id:"garden",name:"花園住宅區",archetype:"residential",population:43e4,elevationM:12,imperviousness:.58,canopyCover:.29,transitAccess:.54,solarCoverage:.18,floodDefense:.32,coolingAccess:.43,industryLoad:.12,heatExposure:48,floodExposure:39,airPollution:33,healthIndex:72,equityIndex:64,resilienceIndex:61},{id:"hillside",name:"山坡保育區",archetype:"upland",population:12e4,elevationM:28,imperviousness:.32,canopyCover:.48,transitAccess:.34,solarCoverage:.14,floodDefense:.38,coolingAccess:.29,industryLoad:.08,heatExposure:37,floodExposure:31,airPollution:28,healthIndex:75,equityIndex:59,resilienceIndex:68}]}function go(i=Je,t={}){const e=t.seed??ah();return{cityId:"taipei",seed:e,scenario:t.scenario??hh,mode:t.mode??"campaign",missionIndex:0,cityName:"台北氣候韌性實驗城",coordinates:Sh,countryCode:"TWN",turn:1,maxTurns:4,year:2026,phase:"planning",budget:64,emissions:72,heatRisk:63,floodRisk:58,airQualityRisk:52,publicHealth:61,equity:56,publicTrust:62,biodiversity:43,energySecurity:55,educationScore:42,sdgScore:56,climateSignals:i,selectedDistrictId:"core",currentChallenge:$c(e,1),mission:Xc(),districts:bh(e),appliedPolicies:[],eventLog:["模擬城初始化：請啟動熱浪任務，觀察各區風險差異後再投資政策。"],evidenceLog:[]}}function $c(i,t,e){const n=Xo.filter(r=>r.id!==e),s=n.length>0?n:Xo;return rh(s,i,t,805393)}const Th=5500,br={min:-30,max:55},Qa={min:0,max:1e3},wh={min:0,max:12},qc={min:0,max:500},Qr=5,to=6,Ah=27,$o=260,Ch=7,Rh=36,Ph=25,Lh=50;async function Dh(i){const t=Yc(),e=await Promise.all(t.ranges.map(g=>Nh(i,g))),n=e.reduce((g,_)=>g.concat(_.dailyMeanTemps),[]),s=e.reduce((g,_)=>g.concat(_.dailyMaxTemps),[]),r=e.reduce((g,_)=>g.concat(_.dailyMinTemps),[]),o=e.reduce((g,_)=>g.concat(_.dailyRain),[]),a=Fh(n,28,br),l=ta(s,Rh,br)/t.years,c=ta(r,Ph,br)/t.years,u=ta(o,Lh,Qa)/t.years,h=Bh(o,$o*to*t.years,Qa),d=eo(h/(t.years*to),0,1500),p=eo(d/$o*.62+u/Ch*.38,.2,4);return{meanTemperatureC:a,temperatureAnomalyC:a-Ah,heatwaveDaysPerSeason:ea(l,1),tropicalNightsPerSeason:ea(c,1),monthlyPrecipitationMm:d,precipitationAnomalyRatio:p,heavyRainDaysPerSeason:ea(u,1)}}async function Ih(i){const t=Yc(),e=await Promise.all(t.ranges.map(u=>Oh(i,u))),n=e.reduce((u,h)=>u.concat(h.temp),[]),s=e.reduce((u,h)=>u.concat(h.precipitation),[]),r=e.reduce((u,h)=>u.concat(h.solar),[]),o=Ar(n,br),a=zh(s,Qa),l=Ar(r,wh),c={};return o!==void 0&&(c.meanTemperatureC=o),a!==void 0&&(c.monthlyPrecipitationMm=eo(a/(t.years*to),0,1500)),l!==void 0&&(c.solarKwhM2Day=l),c}async function Uh(i){var o;const t=new URLSearchParams({latitude:String(i.latitude),longitude:String(i.longitude),hourly:"pm2_5",past_days:"7",timezone:"auto",cell_selection:"land"}),e=await Hr(`https://air-quality-api.open-meteo.com/v1/air-quality?${t}`);if(!e.ok)throw new Error(`Open-Meteo Air Quality failed: ${e.status}`);const n=await e.json(),s=Array.isArray((o=n.hourly)==null?void 0:o.pm2_5)?n.hourly.pm2_5:[],r=Ar(s,qc);return r!==void 0?{pm25UgM3:r}:{}}async function qo(i,t){var a,l;if(!t)return{};const e=new URLSearchParams({coordinates:`${i.latitude},${i.longitude}`,radius:"25000",limit:"20"}),n=await Hr(`https://api.openaq.org/v3/locations?${e}`,{headers:{"X-API-Key":t}});if(!n.ok)throw new Error(`OpenAQ failed: ${n.status}`);const s=await n.json(),r=[];for(const c of s.results??[])for(const u of c.sensors??[]){const h=String(((a=u.parameter)==null?void 0:a.name)??"").toLowerCase();if(h==="pm25"||h==="pm2.5"){const d=(l=u.latest)==null?void 0:l.value;typeof d=="number"&&r.push(d)}}const o=Ar(r,qc);return o!==void 0?{pm25UgM3:o}:{}}async function Nh(i,t){var r,o,a,l;const e=new URLSearchParams({latitude:String(i.latitude),longitude:String(i.longitude),start_date:t.start,end_date:t.end,daily:"temperature_2m_mean,temperature_2m_max,temperature_2m_min,precipitation_sum",timezone:"auto",cell_selection:"land"}),n=await Hr(`https://archive-api.open-meteo.com/v1/archive?${e}`);if(!n.ok)throw new Error(`Open-Meteo ${t.year} failed: ${n.status}`);const s=await n.json();return{dailyMeanTemps:((r=s.daily)==null?void 0:r.temperature_2m_mean)??[],dailyMaxTemps:((o=s.daily)==null?void 0:o.temperature_2m_max)??[],dailyMinTemps:((a=s.daily)==null?void 0:a.temperature_2m_min)??[],dailyRain:((l=s.daily)==null?void 0:l.precipitation_sum)??[]}}async function Oh(i,t){var o;const e=new URLSearchParams({parameters:"T2M,PRECTOTCORR,ALLSKY_SFC_SW_DWN",community:"RE",longitude:String(i.longitude),latitude:String(i.latitude),start:Yo(t.start),end:Yo(t.end),format:"JSON"}),n=await Hr(`https://power.larc.nasa.gov/api/temporal/daily/point?${e}`);if(!n.ok)throw new Error(`NASA POWER ${t.year} failed: ${n.status}`);const r=((o=(await n.json()).properties)==null?void 0:o.parameter)??{};return{temp:Object.values(r.T2M??{}),precipitation:Object.values(r.PRECTOTCORR??{}),solar:Object.values(r.ALLSKY_SFC_SW_DWN??{})}}function Fh(i,t,e){const n=Us(i,e);return n.length===0?t:n.reduce((s,r)=>s+r,0)/n.length}function Bh(i,t,e){const n=Us(i,e);return n.length===0?t:n.reduce((s,r)=>s+r,0)}function Ar(i,t){const e=Us(i,t);if(e.length!==0)return e.reduce((n,s)=>n+s,0)/e.length}function zh(i,t){const e=Us(i,t);if(e.length!==0)return e.reduce((n,s)=>n+s,0)}function ta(i,t,e){return Us(i,e).filter(n=>n>=t).length}function Us(i,t){return i.map(e=>kh(e,t)).filter(e=>e!==void 0)}function kh(i,t){if(!(typeof i!="number"||!Number.isFinite(i))&&!(i<=-900)&&!(t&&(i<t.min||i>t.max)))return i}function eo(i,t,e){return Math.min(e,Math.max(t,i))}function ea(i,t=0){const e=10**t;return Math.round(i*e)/e}async function Hr(i,t={}){const e=new AbortController,n=window.setTimeout(()=>e.abort(),Th);try{return await fetch(i,{...t,signal:t.signal??e.signal})}finally{window.clearTimeout(n)}}function Yc(i=new Date){const t=i.getUTCFullYear(),n=i.getUTCMonth()+1>=11?t:t-1,s=n-Qr+1;return{ranges:Array.from({length:Qr},(o,a)=>{const l=s+a;return{year:l,start:`${l}-05-01`,end:`${l}-10-31`}}),years:Qr,startYear:s,endYear:n}}function Yo(i){return i.replace(/-/g,"")}const Hh={population:2455e3,urbanPopulationRatio:.95},Gh="climate-resilience-lab/api-cache/v1/",Vh=12*60*60*1e3;async function zs(i,t){const e=`${Gh}${i}`;try{const s=window.localStorage.getItem(e);if(s){const r=JSON.parse(s);if(Date.now()-r.t<Vh)return r.v}}catch{}const n=await t();try{window.localStorage.setItem(e,JSON.stringify({t:Date.now(),v:n}))}catch{}return n}async function Wh(i,t){const e=await Xh(),n={id:"localBaseline",name:"台北本地基準補值",status:"fallback",fields:["暖季均溫","熱浪日","熱夜日","暖季月雨量","強降雨日","PM2.5","日照","人口背景"],note:"公開 API 缺漏或無法連線時用來補足欄位，讓課堂仍可討論資料不確定性。"},s=`${i.coordinates.latitude},${i.coordinates.longitude}`,r=[{id:"nasaPower",name:"NASA POWER",fields:["近 5 個完整暖季的太陽輻射、暖季均溫與降雨補充"],loader:()=>zs(`nasaPower/${s}`,()=>Ih(i.coordinates))},{id:"openMeteo",name:"Open-Meteo",fields:["近 5 個完整暖季的熱浪日、熱夜日、強降雨日、暖季月雨量"],loader:()=>zs(`openMeteo/${s}`,()=>Dh(i.coordinates))},{id:"taiwanPop",name:"內政部戶政司人口統計（靜態內建）",fields:["人口背景（臺北市 2024 年底）","都市人口比"],loader:()=>Promise.resolve({...Hh})},{id:"openMeteoAir",name:"Open-Meteo 空氣品質（CAMS）",fields:["PM2.5（免金鑰，CAMS 全球/歐洲再分析）"],loader:()=>zs(`openMeteoAir/${s}`,()=>Uh(i.coordinates))},{id:"openAq",name:"OpenAQ（選用，需 API key）",fields:["PM2.5（地面測站，若提供 key 則覆蓋上者）"],loader:()=>t.openAqApiKey?zs(`openAq/${s}`,()=>qo(i.coordinates,t.openAqApiKey)):qo(i.coordinates,t.openAqApiKey)}],o=await Promise.allSettled(r.map(c=>c.loader())),a=o.reduce((c,u)=>u.status==="fulfilled"?{...c,...jo(u.value)}:c,{}),l=o.map((c,u)=>{const h=r[u];if(c.status==="rejected")return{id:h.id,name:h.name,status:"failed",fields:h.fields,note:String(c.reason)};const d=jo(c.value);return Object.keys(d).length>0?{id:h.id,name:h.name,status:"loaded",fields:h.fields,note:"已載入並覆蓋同名起始欄位。"}:{id:h.id,name:h.name,status:"skipped",fields:h.fields,note:h.id==="openAq"?"未設定 OpenAQ API key；PM2.5 已改由 Open-Meteo 空氣品質（CAMS）提供真實值。":"API 回傳資料缺漏，相關欄位使用台北本地基準補值。"}});return{signals:jc({...e,...a}),sources:[...l,n]}}async function Xh(){try{const i=await fetch("./data/taipei-climate-baseline.json");if(!i.ok)throw new Error("Local baseline missing");const t=await i.json();return jc(t.baseline)}catch{return Je}}function jc(i){const t=sn(fn(i.meanTemperatureC,Je.meanTemperatureC),15,45),e=sn(fn(i.monthlyPrecipitationMm,Je.monthlyPrecipitationMm),0,1500);return{meanTemperatureC:t,temperatureAnomalyC:sn(t-27,-10,15),heatwaveDaysPerSeason:sn(fn(i.heatwaveDaysPerSeason,Je.heatwaveDaysPerSeason),0,184),tropicalNightsPerSeason:sn(fn(i.tropicalNightsPerSeason,Je.tropicalNightsPerSeason),0,184),monthlyPrecipitationMm:e,precipitationAnomalyRatio:sn(fn(i.precipitationAnomalyRatio,Je.precipitationAnomalyRatio),.2,5),heavyRainDaysPerSeason:sn(fn(i.heavyRainDaysPerSeason,Je.heavyRainDaysPerSeason),0,80),pm25UgM3:sn(fn(i.pm25UgM3,Je.pm25UgM3),0,500),solarKwhM2Day:sn(fn(i.solarKwhM2Day,Je.solarKwhM2Day),0,12),population:sn(fn(i.population,Je.population),1,1e8),urbanPopulationRatio:sn(fn(i.urbanPopulationRatio,Je.urbanPopulationRatio),0,1)}}function fn(i,t){return Number.isFinite(i)?Number(i):t}function jo(i){return Object.fromEntries(Object.entries(i).filter(([,t])=>t!==void 0))}function sn(i,t,e){return Math.min(e,Math.max(t,i))}const vo=[{id:"urban-tree-canopy",name:"都市樹冠降溫",category:"cooling",target:"district",cost:12,sdgs:["SDG 3","SDG 11","SDG 13","SDG 15"],summary:"在街道、校園與熱點周邊增加樹蔭，降低行人熱暴露並改善棲地連通。",evidencePrompt:"樹冠會提高遮蔭與蒸散作用，城市熱島壓力下降，健康與韌性分數同步改善。",learningFocus:"城市熱島、蒸散作用、自然為本解方",scienceNote:"深色鋪面會吸收並儲存太陽輻射，樹蔭能減少地表吸熱，葉片蒸散也會帶走熱量，所以同一個城市裡不同街區會有明顯溫差。",classroomPrompt:"如果學校附近只能種 50 棵樹，你會優先放在人最多、最熱，還是最弱勢的區域？為什麼？",effectExplanation:["樹冠覆蓋率上升，模型會降低該區熱暴露。","降溫通道與可步行陰影增加，健康指標與韌性指標上升。","連續綠地可支持鳥類、昆蟲與土壤生態，因此生物多樣性提高。"],cityEffects:{biodiversity:4,publicTrust:1},districtEffects:{canopyCover:.09,coolingAccess:.04,healthIndex:3,resilienceIndex:4}},{id:"cooling-shelters",name:"降溫避難網絡",category:"health",target:"district",cost:8,sdgs:["SDG 3","SDG 10","SDG 11","SDG 13"],summary:"把圖書館、活動中心、捷運站與校園納入熱浪避難點，照顧長者與戶外工作者。",evidencePrompt:"可抵達的冷房、飲水與照護能降低熱傷害，公平性與公共健康直接受益。",learningFocus:"熱傷害、脆弱族群、調適公平",scienceNote:"熱浪不是只看氣溫，還要看人能不能避開高溫。高齡者、慢性病患者、無空調住戶與戶外工作者暴露時間較長，所以降溫服務會明顯影響健康風險。",classroomPrompt:"如果避難中心只能開 12 小時，應該開白天、夜晚，還是分散到不同時段？你會用什麼資料判斷？",effectExplanation:["冷房與飲水點提高降溫可近性，該區冷卻可及性大幅上升。","弱勢族群有更容易抵達的避難點，公平指標上升。","熱衰竭與熱中暑風險下降，公共健康改善。"],cityEffects:{publicHealth:2,equity:3},districtEffects:{coolingAccess:.14,equityIndex:4,healthIndex:5,resilienceIndex:3}},{id:"permeable-streets",name:"海綿街廓改造",category:"flood",target:"district",cost:14,sdgs:["SDG 6","SDG 9","SDG 11","SDG 13"],summary:"把停車格、人行道與廣場改成透水鋪面、雨水花園與滯洪設施。",evidencePrompt:"不透水面下降，短延時強降雨時的逕流會變少，淹水暴露降低。",learningFocus:"逕流、透水鋪面、都市洪水",scienceNote:"水落在水泥或柏油上會快速流向低處，排水系統來不及處理就可能積淹水。透水鋪面與雨水花園能讓部分雨水滲入或暫時停留。",classroomPrompt:"同樣是花 14 百萬預算，你會先改造商圈、河岸住宅，還是工業區？請用淹水暴露與人口解釋。",effectExplanation:["不透水率下降，降雨形成的地表逕流減少。","排水與滯洪能力提高，洪水防護上升。","淹水壓力較低時，街區韌性指標提升。"],cityEffects:{publicTrust:1},districtEffects:{imperviousness:-.08,floodDefense:.12,resilienceIndex:5}},{id:"wetland-buffer",name:"濕地緩衝帶",category:"biodiversity",target:"district",cost:20,sdgs:["SDG 6","SDG 11","SDG 13","SDG 15"],summary:"在河岸、海岸與低窪地恢復濕地，吸收洪峰並增加自然棲地。",evidencePrompt:"濕地像城市的海綿，可以延緩洪峰、降低水患，同時提高生物多樣性。",learningFocus:"自然為本解方、洪峰削減、濕地生態",scienceNote:"濕地能暫存大量雨水，讓洪峰比較慢到達市區；濕地植物與土壤也能提供棲地、過濾污染物，是兼具防災與生態的調適策略。",classroomPrompt:"濕地需要土地，可能會與開發需求衝突。你會如何向居民說明它的防災價值？",effectExplanation:["洪水防護顯著提高，城市總洪水風險下降。","硬鋪面轉為自然地表，不透水率下降。","棲地面積與水陸交界增加，生物多樣性大幅提升。"],cityEffects:{biodiversity:8,floodRisk:-3},districtEffects:{floodDefense:.16,canopyCover:.05,imperviousness:-.04,resilienceIndex:7}},{id:"solar-rooftops",name:"屋頂太陽能聚落",category:"energy",target:"district",cost:16,sdgs:["SDG 7","SDG 9","SDG 11","SDG 13"],summary:"在學校、公宅與工廠屋頂建置太陽能，搭配社區儲能與能源教育。",evidencePrompt:"太陽能覆蓋率提升會降低外部電力依賴，排放下降，能源安全提高。",learningFocus:"再生能源、尖峰用電、能源安全",scienceNote:"熱浪時空調需求會上升，電網容易吃緊。分散式太陽能能在白天提供本地電力，若搭配儲能，停電或尖峰時更有韌性。",classroomPrompt:"太陽能不一定在晚上發電。你會怎麼設計儲能或用電管理，讓它真正幫助熱浪期間的城市？",effectExplanation:["太陽能覆蓋率上升，能源安全指標提高。","使用化石燃料發電的需求降低，城市排放下降。","學校與公共屋頂示範可連結能源教育，教育分數上升。"],cityEffects:{emissions:-5,energySecurity:6,educationScore:2},districtEffects:{solarCoverage:.13,resilienceIndex:2}},{id:"electric-bus-grid",name:"電動公車與低碳路網",category:"mobility",target:"district",cost:18,sdgs:["SDG 3","SDG 7","SDG 11","SDG 13"],summary:"提升電動公車班距、轉乘節點與安全步行路線，降低私人汽機車依賴。",evidencePrompt:"公共運輸可近性提高時，交通排放與空污下降，健康與信任分數改善。",learningFocus:"低碳交通、空氣污染、可近性",scienceNote:"交通排放包含溫室氣體與空氣污染物。當公共運輸更方便，部分旅次會從私人車輛轉移，城市排放與 PM2.5 來源都會降低。",classroomPrompt:"如果同學覺得公車變多仍不想搭，你還需要哪些配套政策讓交通轉型真的發生？",effectExplanation:["大眾運輸可及性上升，私人車輛依賴下降。","交通排放減少，城市排放與空氣品質風險降低。","通勤選擇變多，公共信任與健康指標改善。"],cityEffects:{emissions:-6,airQualityRisk:-3,publicTrust:2},districtEffects:{transitAccess:.12,healthIndex:3,resilienceIndex:3}},{id:"industrial-filter",name:"產業空污治理",category:"industry",target:"district",cost:10,sdgs:["SDG 3","SDG 9","SDG 11","SDG 12"],summary:"更新工廠排放控制、即時監測與稽核，降低鄰近社區污染暴露。",evidencePrompt:"產業負荷下降會降低街區空污，健康指標與城市空氣品質同步改善。",learningFocus:"PM2.5、環境正義、污染管制",scienceNote:"細懸浮微粒會進入呼吸道並提高健康風險。工業區附近居民暴露較高，因此污染管制同時也是環境正義議題。",classroomPrompt:"如果企業擔心成本上升，你會用哪些健康或社會資料說服城市仍要做空污治理？",effectExplanation:["產業負荷下降，該區空氣污染下降。","污染暴露降低，健康指標提高。","城市平均空氣品質風險降低。"],cityEffects:{airQualityRisk:-4,publicHealth:1},districtEffects:{industryLoad:-.1,healthIndex:4,resilienceIndex:2}},{id:"citizen-science-network",name:"公民科學感測網",category:"governance",target:"city",cost:7,sdgs:["SDG 3","SDG 10","SDG 11","SDG 13"],summary:"讓學生、社區與市府共同佈設溫度、雨量與空氣品質感測點，公開資料儀表板。",evidencePrompt:"資料透明會提升公共信任與科學素養，讓資源分配更公平。",learningFocus:"資料素養、感測器、公民參與",scienceNote:"城市風險常常不是平均分布。感測網可以找出熱點、淹水點與空污熱區，讓政策從「感覺」變成可討論的證據。",classroomPrompt:"感測器可能有誤差。你會如何驗證資料，避免錯誤數據影響政策決策？",effectExplanation:["公開資料讓學生與居民理解風險，教育分數提高。","政策分配更有依據，公共信任提升。","看見弱勢區域的暴露差異，公平指標上升。"],cityEffects:{educationScore:8,publicTrust:5,equity:2}}];function _o(i){return vo.find(t=>t.id===i)}const $h=25,qh=18.7,Yh=.5,jh=.2,Kh=5,Zh=[[0,9,0,50],[9.1,35.4,51,100],[35.5,55.4,101,150],[55.5,125.4,151,200],[125.5,225.4,201,300],[225.5,325.4,301,500]],na=[{name:"Good",nameZh:"良好",color:"#00e400",aqiLo:0,aqiHi:50,hazardLo:0,hazardHi:20},{name:"Moderate",nameZh:"普通",color:"#ffff00",aqiLo:51,aqiHi:100,hazardLo:20,hazardHi:40},{name:"Unhealthy for Sensitive Groups",nameZh:"對敏感族群不健康",color:"#ff7e00",aqiLo:101,aqiHi:150,hazardLo:40,hazardHi:60},{name:"Unhealthy",nameZh:"不健康",color:"#ff0000",aqiLo:151,aqiHi:200,hazardLo:60,hazardHi:80},{name:"Very Unhealthy",nameZh:"非常不健康",color:"#8f3f97",aqiLo:201,aqiHi:300,hazardLo:80,hazardHi:95},{name:"Hazardous",nameZh:"危害",color:"#7e0023",aqiLo:301,aqiHi:500,hazardLo:95,hazardHi:100}];function Jh(i){const t=Math.max(0,Math.min(500,i));return na.find(e=>t<=e.aqiHi)??na[na.length-1]}function Qh(i){const t=Jh(i),e=Math.max(1,t.aqiHi-t.aqiLo),n=(Math.max(t.aqiLo,Math.min(t.aqiHi,i))-t.aqiLo)/e;return t.hazardLo+n*(t.hazardHi-t.hazardLo)}const Ko=40,td=1.7;function ed(i){const t=Math.max(0,Math.min(100,i)-Ko),e=100-Ko;return Math.min(100,100*(t/e)**td)}const nd=.05,id=.85;function ze(i,t=0,e=100){return Math.min(e,Math.max(t,i))}function sd(i){const t=Math.max(0,i);for(const[e,n,s,r]of Zh)if(t<=n)return Math.round((r-s)/(n-e)*(t-e)+s);return 500}function Kc(i){const t=ze(20+i.temperatureAnomalyC*6+i.heatwaveDaysPerSeason*.7+i.tropicalNightsPerSeason*.25),e=ze(15+i.precipitationAnomalyRatio*10+i.heavyRainDaysPerSeason*1.6+i.monthlyPrecipitationMm/20),n=sd(i.pm25UgM3),s=ze(Qh(n)),r=ze(28+i.solarKwhM2Day*9);return{heatClimateHazard:t,floodClimateHazard:e,aqiPm25:n,airClimateHazard:s,solarOpportunity:r}}function rd(i,t){const e=qh*(i.imperviousness-Yh)-$h*(i.canopyCover-jh)+(i.archetype==="downtown"?1.5:0)+(i.archetype==="industrial"?.8:0),n=ze(t.heatClimateHazard+e*Kh),s=ze(1+(.45-i.coolingAccess)*.75+(58-i.equityIndex)/200,.6,1.4),r=ze(n*s),o=ze(nd+id*i.imperviousness,0,.95),a=ze(t.floodClimateHazard*(.4+o)),l=ze(1+(.5-i.floodDefense)*.6-i.elevationM*.012+(i.archetype==="coastal"||i.archetype==="river"?.18:0),.6,1.5),c=ze(a*l),u=ze(t.airClimateHazard*.6+i.industryLoad*42-i.transitAccess*14-i.canopyCover*6),h=ze(i.healthIndex*.5+(100-ed(r))*.18+(100-c)*.12+(100-u)*.16+i.coolingAccess*13+i.equityIndex*.08),d=ze(100-r*.22-c*.23-u*.17+i.floodDefense*17+i.canopyCover*14+i.transitAccess*8+i.solarCoverage*7);return{uhiDeltaC:Math.round(e*100)/100,runoffCoefficient:Math.round(o*100)/100,heatExposure:Math.round(r),floodExposure:Math.round(c),airPollution:Math.round(u),healthIndex:Math.round(h),resilienceIndex:Math.round(d)}}const ad=["imperviousness","canopyCover","solarCoverage"],od=["transitAccess","floodDefense","coolingAccess","industryLoad"],ld=["healthIndex","equityIndex","resilienceIndex"],cd=["emissions","heatRisk","floodRisk","airQualityRisk","publicHealth","equity","publicTrust","biodiversity","energySecurity","educationScore"];function ud(i){return vi(gh(i))}function xo(i){return i.appliedPolicies.filter(t=>t.turn===i.turn).length}function Gr(i){return Math.max(0,i.mission.policyLimitPerTurn-xo(i))}function hd(i,t,e=i.selectedDistrictId){if(i.phase==="complete")return i;if(i.mission.status==="briefing")return Ki(i,"請先啟動任務，再審議政策。");if(i.mission.status!=="active")return Ki(i,"目前任務不在進行中。");const n=_o(t);if(!n)return Ki(i,`找不到政策：${t}`);if(Gr(i)<=0)return Ki(i,"本回合政策上限已用完。請進入下一年後再審議新的政策。");if(i.budget<n.cost)return Ki(i,`預算不足，無法投資「${n.name}」。`);const s=i;let r=Zc(i,n,e);const o=Qc(r,n,e),a=Mo(s,r);return r={...r,lastResolution:void 0,appliedPolicies:[{turn:r.turn,year:r.year,policyId:n.id,policyName:n.name,targetDistrictId:n.target==="district"?e:void 0,note:`${o}: ${n.evidencePrompt}`},...r.appliedPolicies].slice(0,12),eventLog:[`${r.year}: 已投資「${n.name}」於${o}。`,Jc(a),...r.eventLog].slice(0,10)},Is(r,{allowCompletion:!1})}function yo(i,t,e=i.selectedDistrictId){const n=_o(t);if(!n)return;const s=Zc(i,n,e),r=Gr(i),o=i.budget>=n.cost,a=i.mission.status==="active";return{policyId:t,affordable:o&&r>0&&a&&i.phase!=="complete",canAffordBudget:o,missionActive:a,remainingActions:r,targetName:Qc(i,n,e),deltas:Mo(i,s)}}function dd(i){if(i.phase==="complete")return i;if(i.mission.status==="briefing")return Ki(i,"請先啟動任務，再進入下一年。");const t=i,e=i.currentChallenge;let n=Ns(i);for(const[o,a]of Object.entries(e.pressure))n[o]=re(n[o]+a);n.budget=Zt(n.budget+18+n.publicTrust*.04-n.emissions*.03),n.year+=1,n.turn+=1,n.phase="planning";const s=dh(n.scenario);n.climateSignals={...n.climateSignals,meanTemperatureC:Zt(n.climateSignals.meanTemperatureC+s.warmingPerYearC,2),temperatureAnomalyC:Zt(n.climateSignals.temperatureAnomalyC+s.warmingPerYearC,2),heatwaveDaysPerSeason:Zt(n.climateSignals.heatwaveDaysPerSeason+s.heatwaveDaysPerYear,1),tropicalNightsPerSeason:Zt(n.climateSignals.tropicalNightsPerSeason+s.tropicalNightsPerYear,1),monthlyPrecipitationMm:Zt(n.climateSignals.monthlyPrecipitationMm+s.monthlyPrecipPerYearMm,1),precipitationAnomalyRatio:Zt(n.climateSignals.precipitationAnomalyRatio+s.precipAnomalyPerYear,2),heavyRainDaysPerSeason:Zt(n.climateSignals.heavyRainDaysPerSeason+s.heavyRainDaysPerYear,1),pm25UgM3:Zt(Math.max(6,n.climateSignals.pm25UgM3+n.airQualityRisk/280-.12),1)},n.currentChallenge=$c(n.seed,n.turn,e.id),n=vi(n);const r={year:n.year,title:e.title,summary:e.body,scienceNote:e.scienceNote,soundCue:e.soundCue,deltas:Mo(t,n),objectiveSnapshot:n.mission.objectives};return n={...n,lastResolution:r,eventLog:[`${n.year}: ${e.title}。${e.body}`,`科學提示：${e.scienceNote}`,Jc(r.deltas),...n.eventLog].slice(0,10),evidenceLog:[...md(t,n),...n.evidenceLog].slice(0,60)},Is(n,{allowCompletion:!0})}function fd(i,t){let e=Ns(i);return e.climateSignals=t,e.eventLog=["已載入 Open-Meteo（含空氣品質 CAMS）/ NASA POWER 的最新可用資料與官方人口統計。",...e.eventLog].slice(0,10),e=vi(e),Is(e,{allowCompletion:!1})}function vi(i){let t=Ns(i);t.districts=t.districts.map(a=>pd(a,t.climateSignals));const e=Kc(t.climateSignals);t.heatRisk=Zt(bn(t.districts,a=>a.heatExposure,a=>a.population)),t.floodRisk=Zt(bn(t.districts,a=>a.floodExposure,a=>a.population)),t.airQualityRisk=Zt(bn(t.districts,a=>a.airPollution,a=>a.population)),t.publicHealth=Zt(bn(t.districts,a=>a.healthIndex,a=>a.population)),t.equity=Zt(bn(t.districts,a=>a.equityIndex,a=>a.population));const n=bn(t.districts,a=>a.transitAccess,a=>a.population),s=bn(t.districts,a=>a.solarCoverage,a=>a.population),r=bn(t.districts,a=>a.canopyCover,a=>a.population),o=bn(t.districts,a=>a.industryLoad,a=>a.population);t.emissions=re(Zt(t.emissions+o*1.5-s*4.2-n*1.8+t.heatRisk*.01)),t.biodiversity=re(Zt(t.biodiversity+r*4-t.floodRisk*.02)),t.energySecurity=re(Zt(t.energySecurity+s*6+e.solarOpportunity*.04-t.heatRisk*.025)),t.sdgScore=Zt(.17*t.publicHealth+.14*t.equity+.12*t.publicTrust+.12*t.energySecurity+.12*t.biodiversity+.11*(100-t.heatRisk)+.1*(100-t.floodRisk)+.08*(100-t.airQualityRisk)+.04*t.educationScore);for(const a of cd)t[a]=re(t[a]);return t=Is(t,{allowCompletion:!1}),t}function Zc(i,t,e){const n=Ns(i);if(n.budget=Zt(n.budget-t.cost),t.cityEffects)for(const[s,r]of Object.entries(t.cityEffects))n[s]=re(n[s]+r);if(t.target==="district"){const s=n.districts.find(r=>r.id===e)??n.districts[0];if(t.districtEffects)for(const[r,o]of Object.entries(t.districtEffects))ad.includes(r)?s.cells=uh(s.cells,r,o,n.seed+n.turn*101):od.includes(r)&&(s[r]=Ja(s[r]+o)),ld.includes(r)&&(s[r]=re(s[r]+o))}return vi(n)}function pd(i,t){const e=oh(i.cells),n={...i,imperviousness:e.imperviousness,canopyCover:e.canopyCover,solarCoverage:e.solarCoverage,floodDefense:Ja(i.floodDefense+e.floodDefenseBonus),coolingAccess:Ja(i.coolingAccess+e.coolingAccessBonus)},s=Kc(t),r=rd(n,s);return{...i,imperviousness:e.imperviousness,canopyCover:e.canopyCover,solarCoverage:e.solarCoverage,heatExposure:r.heatExposure,floodExposure:r.floodExposure,airPollution:r.airPollution,healthIndex:r.healthIndex,resilienceIndex:r.resilienceIndex,uhiDeltaC:r.uhiDeltaC,runoffCoefficient:r.runoffCoefficient}}function Mo(i,t){return{budget:Zt(t.budget-i.budget),sdgScore:Zt(t.sdgScore-i.sdgScore),heatRisk:Zt(t.heatRisk-i.heatRisk),floodRisk:Zt(t.floodRisk-i.floodRisk),airQualityRisk:Zt(t.airQualityRisk-i.airQualityRisk),publicHealth:Zt(t.publicHealth-i.publicHealth),equity:Zt(t.equity-i.equity)}}function Jc(i){const t=ks(i.heatRisk??0),e=ks(i.publicHealth??0),n=ks(i.equity??0),s=ks(i.sdgScore??0);return`影響摘要：熱風險 ${t}、公共健康 ${e}、公平性 ${n}、SDGs 綜合分數 ${s}。`}function ks(i){return i>0?`+${Zt(i,1)}`:String(Zt(i,1))}function md(i,t){const e=t.districts.find(r=>r.id===t.selectedDistrictId)??t.districts[0],n=Zt(t.heatRisk-i.heatRisk,1),s=Zt(t.publicHealth-i.publicHealth,1);return[{turn:t.turn,year:t.year,kind:"climate",label:"暖季均溫 / 熱夜",value:`${t.climateSignals.meanTemperatureC}°C / ${t.climateSignals.tropicalNightsPerSeason} 夜`,source:`SSP 情境（${t.scenario.toUpperCase()}）+ Open-Meteo / NASA POWER 基準`},{turn:t.turn,year:t.year,kind:"district",label:`${e.name} UHI ΔT / 逕流係數`,value:`${e.uhiDeltaC??"—"}°C / ${e.runoffCoefficient??"—"}`,source:"Ziter et al. 2019 PNAS（UHI 靈敏度）、合理化公式（逕流）"},{turn:t.turn,year:t.year,kind:"policy",label:"本年度城市指標變化",value:`熱風險 ${n>=0?"+":""}${n}、公共健康 ${s>=0?"+":""}${s}`,source:"模擬引擎（IPCC AR6 Hazard×Exposure×Vulnerability）"}]}function Qc(i,t,e){var n;return t.target==="city"?"全城市":((n=i.districts.find(s=>s.id===e))==null?void 0:n.name)??"未知街區"}function Ki(i,t){const e=Ns(i);return e.eventLog=[t,...e.eventLog].slice(0,10),e}function Ns(i){return{...i,currentChallenge:{...i.currentChallenge,pressure:{...i.currentChallenge.pressure}},mission:{...i.mission,objectives:i.mission.objectives.map(t=>({...t}))},lastResolution:i.lastResolution?{...i.lastResolution,deltas:{...i.lastResolution.deltas},objectiveSnapshot:i.lastResolution.objectiveSnapshot.map(t=>({...t}))}:void 0,climateSignals:{...i.climateSignals},districts:i.districts.map(t=>({...t,cells:[...t.cells]})),appliedPolicies:i.appliedPolicies.map(t=>({...t})),eventLog:[...i.eventLog],evidenceLog:i.evidenceLog.map(t=>({...t}))}}/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const So="165",Mi={ROTATE:0,DOLLY:1,PAN:2},Si={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},gd=0,Zo=1,vd=2,tu=1,eu=2,Rn=3,Yn=0,Ue=1,je=2,Dn=0,Qi=1,we=2,Jo=3,Qo=4,_d=5,li=100,xd=101,yd=102,Md=103,Sd=104,bd=200,Ed=201,Td=202,wd=203,no=204,io=205,Ad=206,Cd=207,Rd=208,Pd=209,Ld=210,Dd=211,Id=212,Ud=213,Nd=214,Od=0,Fd=1,Bd=2,Cr=3,zd=4,kd=5,Hd=6,Gd=7,nu=0,Vd=1,Wd=2,Xn=0,iu=1,su=2,ru=3,bo=4,Xd=5,au=6,ou=7,lu=300,ns=301,is=302,so=303,ro=304,Vr=306,Ls=1e3,ui=1001,ao=1002,He=1003,$d=1004,Hs=1005,un=1006,ia=1007,hi=1008,jn=1009,qd=1010,Yd=1011,Rr=1012,cu=1013,ss=1014,Pn=1015,$n=1016,uu=1017,hu=1018,rs=1020,jd=35902,Kd=1021,Zd=1022,yn=1023,Jd=1024,Qd=1025,ts=1026,as=1027,du=1028,fu=1029,tf=1030,pu=1031,mu=1033,sa=33776,ra=33777,aa=33778,oa=33779,tl=35840,el=35841,nl=35842,il=35843,sl=36196,rl=37492,al=37496,ol=37808,ll=37809,cl=37810,ul=37811,hl=37812,dl=37813,fl=37814,pl=37815,ml=37816,gl=37817,vl=37818,_l=37819,xl=37820,yl=37821,la=36492,Ml=36494,Sl=36495,ef=36283,bl=36284,El=36285,Tl=36286,nf=3200,sf=3201,gu=0,rf=1,Vn="",tn="srgb",Kn="srgb-linear",Eo="display-p3",Wr="display-p3-linear",Pr="linear",oe="srgb",Lr="rec709",Dr="p3",bi=7680,wl=519,af=512,of=513,lf=514,vu=515,cf=516,uf=517,hf=518,df=519,oo=35044,Al="300 es",Ln=2e3,Ir=2001;class _i{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){if(this._listeners===void 0)return!1;const n=this._listeners;return n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){if(this._listeners===void 0)return;const s=this._listeners[t];if(s!==void 0){const r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){if(this._listeners===void 0)return;const n=this._listeners[t.type];if(n!==void 0){t.target=this;const s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,t);t.target=null}}}const De=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Er=Math.PI/180,lo=180/Math.PI;function qn(){const i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(De[i&255]+De[i>>8&255]+De[i>>16&255]+De[i>>24&255]+"-"+De[t&255]+De[t>>8&255]+"-"+De[t>>16&15|64]+De[t>>24&255]+"-"+De[e&63|128]+De[e>>8&255]+"-"+De[e>>16&255]+De[e>>24&255]+De[n&255]+De[n>>8&255]+De[n>>16&255]+De[n>>24&255]).toLowerCase()}function Re(i,t,e){return Math.max(t,Math.min(e,i))}function ff(i,t){return(i%t+t)%t}function ca(i,t,e){return(1-e)*i+e*t}function xn(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function se(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}const pf={DEG2RAD:Er};class tt{constructor(t=0,e=0){tt.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(Re(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){const n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,o=this.y-t.y;return this.x=r*n-o*s+t.x,this.y=r*s+o*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Ot{constructor(t,e,n,s,r,o,a,l,c){Ot.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,l,c)}set(t,e,n,s,r,o,a,l,c){const u=this.elements;return u[0]=t,u[1]=s,u[2]=a,u[3]=e,u[4]=r,u[5]=l,u[6]=n,u[7]=o,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],u=n[4],h=n[7],d=n[2],p=n[5],g=n[8],_=s[0],m=s[3],f=s[6],S=s[1],x=s[4],T=s[7],P=s[2],w=s[5],A=s[8];return r[0]=o*_+a*S+l*P,r[3]=o*m+a*x+l*w,r[6]=o*f+a*T+l*A,r[1]=c*_+u*S+h*P,r[4]=c*m+u*x+h*w,r[7]=c*f+u*T+h*A,r[2]=d*_+p*S+g*P,r[5]=d*m+p*x+g*w,r[8]=d*f+p*T+g*A,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],u=t[8];return e*o*u-e*a*c-n*r*u+n*a*l+s*r*c-s*o*l}invert(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],u=t[8],h=u*o-a*c,d=a*l-u*r,p=c*r-o*l,g=e*h+n*d+s*p;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const _=1/g;return t[0]=h*_,t[1]=(s*c-u*n)*_,t[2]=(a*n-s*o)*_,t[3]=d*_,t[4]=(u*e-s*l)*_,t[5]=(s*r-a*e)*_,t[6]=p*_,t[7]=(n*l-c*e)*_,t[8]=(o*e-n*r)*_,this}transpose(){let t;const e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,o,a){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+t,-s*c,s*l,-s*(-c*o+l*a)+a+e,0,0,1),this}scale(t,e){return this.premultiply(ua.makeScale(t,e)),this}rotate(t){return this.premultiply(ua.makeRotation(-t)),this}translate(t,e){return this.premultiply(ua.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){const e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}}const ua=new Ot;function _u(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function Ur(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function mf(){const i=Ur("canvas");return i.style.display="block",i}const Cl={};function To(i){i in Cl||(Cl[i]=!0,console.warn(i))}function gf(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}const Rl=new Ot().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),Pl=new Ot().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),Gs={[Kn]:{transfer:Pr,primaries:Lr,toReference:i=>i,fromReference:i=>i},[tn]:{transfer:oe,primaries:Lr,toReference:i=>i.convertSRGBToLinear(),fromReference:i=>i.convertLinearToSRGB()},[Wr]:{transfer:Pr,primaries:Dr,toReference:i=>i.applyMatrix3(Pl),fromReference:i=>i.applyMatrix3(Rl)},[Eo]:{transfer:oe,primaries:Dr,toReference:i=>i.convertSRGBToLinear().applyMatrix3(Pl),fromReference:i=>i.applyMatrix3(Rl).convertLinearToSRGB()}},vf=new Set([Kn,Wr]),te={enabled:!0,_workingColorSpace:Kn,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(i){if(!vf.has(i))throw new Error(`Unsupported working color space, "${i}".`);this._workingColorSpace=i},convert:function(i,t,e){if(this.enabled===!1||t===e||!t||!e)return i;const n=Gs[t].toReference,s=Gs[e].fromReference;return s(n(i))},fromWorkingColorSpace:function(i,t){return this.convert(i,this._workingColorSpace,t)},toWorkingColorSpace:function(i,t){return this.convert(i,t,this._workingColorSpace)},getPrimaries:function(i){return Gs[i].primaries},getTransfer:function(i){return i===Vn?Pr:Gs[i].transfer}};function es(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function ha(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let Ei;class _f{static getDataURL(t){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let e;if(t instanceof HTMLCanvasElement)e=t;else{Ei===void 0&&(Ei=Ur("canvas")),Ei.width=t.width,Ei.height=t.height;const n=Ei.getContext("2d");t instanceof ImageData?n.putImageData(t,0,0):n.drawImage(t,0,0,t.width,t.height),e=Ei}return e.width>2048||e.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",t),e.toDataURL("image/jpeg",.6)):e.toDataURL("image/png")}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const e=Ur("canvas");e.width=t.width,e.height=t.height;const n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);const s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=es(r[o]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){const e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(es(e[n]/255)*255):e[n]=es(e[n]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let xf=0;class xu{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:xf++}),this.uuid=qn(),this.data=t,this.dataReady=!0,this.version=0}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(da(s[o].image)):r.push(da(s[o]))}else r=da(s);n.url=r}return e||(t.images[this.uuid]=n),n}}function da(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?_f.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let yf=0;class Ne extends _i{constructor(t=Ne.DEFAULT_IMAGE,e=Ne.DEFAULT_MAPPING,n=ui,s=ui,r=un,o=hi,a=yn,l=jn,c=Ne.DEFAULT_ANISOTROPY,u=Vn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:yf++}),this.uuid=qn(),this.name="",this.source=new xu(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new tt(0,0),this.repeat=new tt(1,1),this.center=new tt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ot,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==lu)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Ls:t.x=t.x-Math.floor(t.x);break;case ui:t.x=t.x<0?0:1;break;case ao:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Ls:t.y=t.y-Math.floor(t.y);break;case ui:t.y=t.y<0?0:1;break;case ao:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}Ne.DEFAULT_IMAGE=null;Ne.DEFAULT_MAPPING=lu;Ne.DEFAULT_ANISOTROPY=1;class ue{constructor(t=0,e=0,n=0,s=1){ue.prototype.isVector4=!0,this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const e=this.x,n=this.y,s=this.z,r=this.w,o=t.elements;return this.x=o[0]*e+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*e+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*e+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*e+o[7]*n+o[11]*s+o[15]*r,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r;const l=t.elements,c=l[0],u=l[4],h=l[8],d=l[1],p=l[5],g=l[9],_=l[2],m=l[6],f=l[10];if(Math.abs(u-d)<.01&&Math.abs(h-_)<.01&&Math.abs(g-m)<.01){if(Math.abs(u+d)<.1&&Math.abs(h+_)<.1&&Math.abs(g+m)<.1&&Math.abs(c+p+f-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;const x=(c+1)/2,T=(p+1)/2,P=(f+1)/2,w=(u+d)/4,A=(h+_)/4,I=(g+m)/4;return x>T&&x>P?x<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(x),s=w/n,r=A/n):T>P?T<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(T),n=w/s,r=I/s):P<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(P),n=A/r,s=I/r),this.set(n,s,r,e),this}let S=Math.sqrt((m-g)*(m-g)+(h-_)*(h-_)+(d-u)*(d-u));return Math.abs(S)<.001&&(S=1),this.x=(m-g)/S,this.y=(h-_)/S,this.z=(d-u)/S,this.w=Math.acos((c+p+f-1)/2),this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this.w=Math.max(t.w,Math.min(e.w,this.w)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this.w=Math.max(t,Math.min(e,this.w)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Mf extends _i{constructor(t=1,e=1,n={}){super(),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=1,this.scissor=new ue(0,0,t,e),this.scissorTest=!1,this.viewport=new ue(0,0,t,e);const s={width:t,height:e,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:un,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);const r=new Ne(s,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);r.flipY=!1,r.generateMipmaps=n.generateMipmaps,r.internalFormat=n.internalFormat,this.textures=[];const o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let n=0,s=t.textures.length;n<s;n++)this.textures[n]=t.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;const e=Object.assign({},t.texture.image);return this.texture.source=new xu(e),this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class dn extends Mf{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}}class yu extends Ne{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=He,this.minFilter=He,this.wrapR=ui,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class Sf extends Ne{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=He,this.minFilter=He,this.wrapR=ui,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class gi{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,o,a){let l=n[s+0],c=n[s+1],u=n[s+2],h=n[s+3];const d=r[o+0],p=r[o+1],g=r[o+2],_=r[o+3];if(a===0){t[e+0]=l,t[e+1]=c,t[e+2]=u,t[e+3]=h;return}if(a===1){t[e+0]=d,t[e+1]=p,t[e+2]=g,t[e+3]=_;return}if(h!==_||l!==d||c!==p||u!==g){let m=1-a;const f=l*d+c*p+u*g+h*_,S=f>=0?1:-1,x=1-f*f;if(x>Number.EPSILON){const P=Math.sqrt(x),w=Math.atan2(P,f*S);m=Math.sin(m*w)/P,a=Math.sin(a*w)/P}const T=a*S;if(l=l*m+d*T,c=c*m+p*T,u=u*m+g*T,h=h*m+_*T,m===1-a){const P=1/Math.sqrt(l*l+c*c+u*u+h*h);l*=P,c*=P,u*=P,h*=P}}t[e]=l,t[e+1]=c,t[e+2]=u,t[e+3]=h}static multiplyQuaternionsFlat(t,e,n,s,r,o){const a=n[s],l=n[s+1],c=n[s+2],u=n[s+3],h=r[o],d=r[o+1],p=r[o+2],g=r[o+3];return t[e]=a*g+u*h+l*p-c*d,t[e+1]=l*g+u*d+c*h-a*p,t[e+2]=c*g+u*p+a*d-l*h,t[e+3]=u*g-a*h-l*d-c*p,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){const n=t._x,s=t._y,r=t._z,o=t._order,a=Math.cos,l=Math.sin,c=a(n/2),u=a(s/2),h=a(r/2),d=l(n/2),p=l(s/2),g=l(r/2);switch(o){case"XYZ":this._x=d*u*h+c*p*g,this._y=c*p*h-d*u*g,this._z=c*u*g+d*p*h,this._w=c*u*h-d*p*g;break;case"YXZ":this._x=d*u*h+c*p*g,this._y=c*p*h-d*u*g,this._z=c*u*g-d*p*h,this._w=c*u*h+d*p*g;break;case"ZXY":this._x=d*u*h-c*p*g,this._y=c*p*h+d*u*g,this._z=c*u*g+d*p*h,this._w=c*u*h-d*p*g;break;case"ZYX":this._x=d*u*h-c*p*g,this._y=c*p*h+d*u*g,this._z=c*u*g-d*p*h,this._w=c*u*h+d*p*g;break;case"YZX":this._x=d*u*h+c*p*g,this._y=c*p*h+d*u*g,this._z=c*u*g-d*p*h,this._w=c*u*h-d*p*g;break;case"XZY":this._x=d*u*h-c*p*g,this._y=c*p*h-d*u*g,this._z=c*u*g+d*p*h,this._w=c*u*h+d*p*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){const n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){const e=t.elements,n=e[0],s=e[4],r=e[8],o=e[1],a=e[5],l=e[9],c=e[2],u=e[6],h=e[10],d=n+a+h;if(d>0){const p=.5/Math.sqrt(d+1);this._w=.25/p,this._x=(u-l)*p,this._y=(r-c)*p,this._z=(o-s)*p}else if(n>a&&n>h){const p=2*Math.sqrt(1+n-a-h);this._w=(u-l)/p,this._x=.25*p,this._y=(s+o)/p,this._z=(r+c)/p}else if(a>h){const p=2*Math.sqrt(1+a-n-h);this._w=(r-c)/p,this._x=(s+o)/p,this._y=.25*p,this._z=(l+u)/p}else{const p=2*Math.sqrt(1+h-n-a);this._w=(o-s)/p,this._x=(r+c)/p,this._y=(l+u)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<Number.EPSILON?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(Re(this.dot(t),-1,1)))}rotateTowards(t,e){const n=this.angleTo(t);if(n===0)return this;const s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){const n=t._x,s=t._y,r=t._z,o=t._w,a=e._x,l=e._y,c=e._z,u=e._w;return this._x=n*u+o*a+s*c-r*l,this._y=s*u+o*l+r*a-n*c,this._z=r*u+o*c+n*l-s*a,this._w=o*u-n*a-s*l-r*c,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);const n=this._x,s=this._y,r=this._z,o=this._w;let a=o*t._w+n*t._x+s*t._y+r*t._z;if(a<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,a=-a):this.copy(t),a>=1)return this._w=o,this._x=n,this._y=s,this._z=r,this;const l=1-a*a;if(l<=Number.EPSILON){const p=1-e;return this._w=p*o+e*this._w,this._x=p*n+e*this._x,this._y=p*s+e*this._y,this._z=p*r+e*this._z,this.normalize(),this}const c=Math.sqrt(l),u=Math.atan2(c,a),h=Math.sin((1-e)*u)/c,d=Math.sin(e*u)/c;return this._w=o*h+this._w*d,this._x=n*h+this._x*d,this._y=s*h+this._y*d,this._z=r*h+this._z*d,this._onChangeCallback(),this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){const t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class C{constructor(t=0,e=0,n=0){C.prototype.isVector3=!0,this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Ll.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Ll.setFromAxisAngle(t,e))}applyMatrix3(t){const e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const e=this.x,n=this.y,s=this.z,r=t.elements,o=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(t){const e=this.x,n=this.y,s=this.z,r=t.x,o=t.y,a=t.z,l=t.w,c=2*(o*s-a*n),u=2*(a*e-r*s),h=2*(r*n-o*e);return this.x=e+l*c+o*h-a*u,this.y=n+l*u+a*c-r*h,this.z=s+l*h+r*u-o*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){const n=t.x,s=t.y,r=t.z,o=e.x,a=e.y,l=e.z;return this.x=s*l-r*a,this.y=r*o-n*l,this.z=n*a-s*o,this}projectOnVector(t){const e=t.lengthSq();if(e===0)return this.set(0,0,0);const n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return fa.copy(this).projectOnVector(t),this.sub(fa)}reflect(t){return this.sub(fa.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(Re(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){const s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){const e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const fa=new C,Ll=new gi;class xi{constructor(t=new C(1/0,1/0,1/0),e=new C(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(rn.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(rn.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){const n=rn.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);const n=t.geometry;if(n!==void 0){const r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,rn):rn.fromBufferAttribute(r,o),rn.applyMatrix4(t.matrixWorld),this.expandByPoint(rn);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Vs.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Vs.copy(n.boundingBox)),Vs.applyMatrix4(t.matrixWorld),this.union(Vs)}const s=t.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return!(t.x<this.min.x||t.x>this.max.x||t.y<this.min.y||t.y>this.max.y||t.z<this.min.z||t.z>this.max.z)}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return!(t.max.x<this.min.x||t.min.x>this.max.x||t.max.y<this.min.y||t.min.y>this.max.y||t.max.z<this.min.z||t.min.z>this.max.z)}intersectsSphere(t){return this.clampPoint(t.center,rn),rn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(hs),Ws.subVectors(this.max,hs),Ti.subVectors(t.a,hs),wi.subVectors(t.b,hs),Ai.subVectors(t.c,hs),On.subVectors(wi,Ti),Fn.subVectors(Ai,wi),ei.subVectors(Ti,Ai);let e=[0,-On.z,On.y,0,-Fn.z,Fn.y,0,-ei.z,ei.y,On.z,0,-On.x,Fn.z,0,-Fn.x,ei.z,0,-ei.x,-On.y,On.x,0,-Fn.y,Fn.x,0,-ei.y,ei.x,0];return!pa(e,Ti,wi,Ai,Ws)||(e=[1,0,0,0,1,0,0,0,1],!pa(e,Ti,wi,Ai,Ws))?!1:(Xs.crossVectors(On,Fn),e=[Xs.x,Xs.y,Xs.z],pa(e,Ti,wi,Ai,Ws))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,rn).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(rn).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(En[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),En[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),En[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),En[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),En[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),En[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),En[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),En[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(En),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}}const En=[new C,new C,new C,new C,new C,new C,new C,new C],rn=new C,Vs=new xi,Ti=new C,wi=new C,Ai=new C,On=new C,Fn=new C,ei=new C,hs=new C,Ws=new C,Xs=new C,ni=new C;function pa(i,t,e,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){ni.fromArray(i,r);const a=s.x*Math.abs(ni.x)+s.y*Math.abs(ni.y)+s.z*Math.abs(ni.z),l=t.dot(ni),c=e.dot(ni),u=n.dot(ni);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>a)return!1}return!0}const bf=new xi,ds=new C,ma=new C;class yi{constructor(t=new C,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){const n=this.center;e!==void 0?n.copy(e):bf.setFromPoints(t).getCenter(n);let s=0;for(let r=0,o=t.length;r<o;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){const n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;ds.subVectors(t,this.center);const e=ds.lengthSq();if(e>this.radius*this.radius){const n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(ds,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(ma.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(ds.copy(t.center).add(ma)),this.expandByPoint(ds.copy(t.center).sub(ma))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}}const Tn=new C,ga=new C,$s=new C,Bn=new C,va=new C,qs=new C,_a=new C;class Os{constructor(t=new C,e=new C(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Tn)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);const n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const e=Tn.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Tn.copy(this.origin).addScaledVector(this.direction,e),Tn.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){ga.copy(t).add(e).multiplyScalar(.5),$s.copy(e).sub(t).normalize(),Bn.copy(this.origin).sub(ga);const r=t.distanceTo(e)*.5,o=-this.direction.dot($s),a=Bn.dot(this.direction),l=-Bn.dot($s),c=Bn.lengthSq(),u=Math.abs(1-o*o);let h,d,p,g;if(u>0)if(h=o*l-a,d=o*a-l,g=r*u,h>=0)if(d>=-g)if(d<=g){const _=1/u;h*=_,d*=_,p=h*(h+o*d+2*a)+d*(o*h+d+2*l)+c}else d=r,h=Math.max(0,-(o*d+a)),p=-h*h+d*(d+2*l)+c;else d=-r,h=Math.max(0,-(o*d+a)),p=-h*h+d*(d+2*l)+c;else d<=-g?(h=Math.max(0,-(-o*r+a)),d=h>0?-r:Math.min(Math.max(-r,-l),r),p=-h*h+d*(d+2*l)+c):d<=g?(h=0,d=Math.min(Math.max(-r,-l),r),p=d*(d+2*l)+c):(h=Math.max(0,-(o*r+a)),d=h>0?r:Math.min(Math.max(-r,-l),r),p=-h*h+d*(d+2*l)+c);else d=o>0?-r:r,h=Math.max(0,-(o*d+a)),p=-h*h+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,h),s&&s.copy(ga).addScaledVector($s,d),p}intersectSphere(t,e){Tn.subVectors(t.center,this.origin);const n=Tn.dot(this.direction),s=Tn.dot(Tn)-n*n,r=t.radius*t.radius;if(s>r)return null;const o=Math.sqrt(r-s),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,e):this.at(a,e)}intersectsSphere(t){return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){const n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){const e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,o,a,l;const c=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,d=this.origin;return c>=0?(n=(t.min.x-d.x)*c,s=(t.max.x-d.x)*c):(n=(t.max.x-d.x)*c,s=(t.min.x-d.x)*c),u>=0?(r=(t.min.y-d.y)*u,o=(t.max.y-d.y)*u):(r=(t.max.y-d.y)*u,o=(t.min.y-d.y)*u),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),h>=0?(a=(t.min.z-d.z)*h,l=(t.max.z-d.z)*h):(a=(t.max.z-d.z)*h,l=(t.min.z-d.z)*h),n>l||a>s)||((a>n||n!==n)&&(n=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,Tn)!==null}intersectTriangle(t,e,n,s,r){va.subVectors(e,t),qs.subVectors(n,t),_a.crossVectors(va,qs);let o=this.direction.dot(_a),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Bn.subVectors(this.origin,t);const l=a*this.direction.dot(qs.crossVectors(Bn,qs));if(l<0)return null;const c=a*this.direction.dot(va.cross(Bn));if(c<0||l+c>o)return null;const u=-a*Bn.dot(_a);return u<0?null:this.at(u/o,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Jt{constructor(t,e,n,s,r,o,a,l,c,u,h,d,p,g,_,m){Jt.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,l,c,u,h,d,p,g,_,m)}set(t,e,n,s,r,o,a,l,c,u,h,d,p,g,_,m){const f=this.elements;return f[0]=t,f[4]=e,f[8]=n,f[12]=s,f[1]=r,f[5]=o,f[9]=a,f[13]=l,f[2]=c,f[6]=u,f[10]=h,f[14]=d,f[3]=p,f[7]=g,f[11]=_,f[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Jt().fromArray(this.elements)}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){const e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){const e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){const e=this.elements,n=t.elements,s=1/Ci.setFromMatrixColumn(t,0).length(),r=1/Ci.setFromMatrixColumn(t,1).length(),o=1/Ci.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*o,e[9]=n[9]*o,e[10]=n[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){const e=this.elements,n=t.x,s=t.y,r=t.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(s),c=Math.sin(s),u=Math.cos(r),h=Math.sin(r);if(t.order==="XYZ"){const d=o*u,p=o*h,g=a*u,_=a*h;e[0]=l*u,e[4]=-l*h,e[8]=c,e[1]=p+g*c,e[5]=d-_*c,e[9]=-a*l,e[2]=_-d*c,e[6]=g+p*c,e[10]=o*l}else if(t.order==="YXZ"){const d=l*u,p=l*h,g=c*u,_=c*h;e[0]=d+_*a,e[4]=g*a-p,e[8]=o*c,e[1]=o*h,e[5]=o*u,e[9]=-a,e[2]=p*a-g,e[6]=_+d*a,e[10]=o*l}else if(t.order==="ZXY"){const d=l*u,p=l*h,g=c*u,_=c*h;e[0]=d-_*a,e[4]=-o*h,e[8]=g+p*a,e[1]=p+g*a,e[5]=o*u,e[9]=_-d*a,e[2]=-o*c,e[6]=a,e[10]=o*l}else if(t.order==="ZYX"){const d=o*u,p=o*h,g=a*u,_=a*h;e[0]=l*u,e[4]=g*c-p,e[8]=d*c+_,e[1]=l*h,e[5]=_*c+d,e[9]=p*c-g,e[2]=-c,e[6]=a*l,e[10]=o*l}else if(t.order==="YZX"){const d=o*l,p=o*c,g=a*l,_=a*c;e[0]=l*u,e[4]=_-d*h,e[8]=g*h+p,e[1]=h,e[5]=o*u,e[9]=-a*u,e[2]=-c*u,e[6]=p*h+g,e[10]=d-_*h}else if(t.order==="XZY"){const d=o*l,p=o*c,g=a*l,_=a*c;e[0]=l*u,e[4]=-h,e[8]=c*u,e[1]=d*h+_,e[5]=o*u,e[9]=p*h-g,e[2]=g*h-p,e[6]=a*u,e[10]=_*h+d}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(Ef,t,Tf)}lookAt(t,e,n){const s=this.elements;return Xe.subVectors(t,e),Xe.lengthSq()===0&&(Xe.z=1),Xe.normalize(),zn.crossVectors(n,Xe),zn.lengthSq()===0&&(Math.abs(n.z)===1?Xe.x+=1e-4:Xe.z+=1e-4,Xe.normalize(),zn.crossVectors(n,Xe)),zn.normalize(),Ys.crossVectors(Xe,zn),s[0]=zn.x,s[4]=Ys.x,s[8]=Xe.x,s[1]=zn.y,s[5]=Ys.y,s[9]=Xe.y,s[2]=zn.z,s[6]=Ys.z,s[10]=Xe.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],u=n[1],h=n[5],d=n[9],p=n[13],g=n[2],_=n[6],m=n[10],f=n[14],S=n[3],x=n[7],T=n[11],P=n[15],w=s[0],A=s[4],I=s[8],E=s[12],y=s[1],L=s[5],B=s[9],z=s[13],$=s[2],Y=s[6],W=s[10],j=s[14],X=s[3],ht=s[7],dt=s[11],gt=s[15];return r[0]=o*w+a*y+l*$+c*X,r[4]=o*A+a*L+l*Y+c*ht,r[8]=o*I+a*B+l*W+c*dt,r[12]=o*E+a*z+l*j+c*gt,r[1]=u*w+h*y+d*$+p*X,r[5]=u*A+h*L+d*Y+p*ht,r[9]=u*I+h*B+d*W+p*dt,r[13]=u*E+h*z+d*j+p*gt,r[2]=g*w+_*y+m*$+f*X,r[6]=g*A+_*L+m*Y+f*ht,r[10]=g*I+_*B+m*W+f*dt,r[14]=g*E+_*z+m*j+f*gt,r[3]=S*w+x*y+T*$+P*X,r[7]=S*A+x*L+T*Y+P*ht,r[11]=S*I+x*B+T*W+P*dt,r[15]=S*E+x*z+T*j+P*gt,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],o=t[1],a=t[5],l=t[9],c=t[13],u=t[2],h=t[6],d=t[10],p=t[14],g=t[3],_=t[7],m=t[11],f=t[15];return g*(+r*l*h-s*c*h-r*a*d+n*c*d+s*a*p-n*l*p)+_*(+e*l*p-e*c*d+r*o*d-s*o*p+s*c*u-r*l*u)+m*(+e*c*h-e*a*p-r*o*h+n*o*p+r*a*u-n*c*u)+f*(-s*a*u-e*l*h+e*a*d+s*o*h-n*o*d+n*l*u)}transpose(){const t=this.elements;let e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){const s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],u=t[8],h=t[9],d=t[10],p=t[11],g=t[12],_=t[13],m=t[14],f=t[15],S=h*m*c-_*d*c+_*l*p-a*m*p-h*l*f+a*d*f,x=g*d*c-u*m*c-g*l*p+o*m*p+u*l*f-o*d*f,T=u*_*c-g*h*c+g*a*p-o*_*p-u*a*f+o*h*f,P=g*h*l-u*_*l-g*a*d+o*_*d+u*a*m-o*h*m,w=e*S+n*x+s*T+r*P;if(w===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const A=1/w;return t[0]=S*A,t[1]=(_*d*r-h*m*r-_*s*p+n*m*p+h*s*f-n*d*f)*A,t[2]=(a*m*r-_*l*r+_*s*c-n*m*c-a*s*f+n*l*f)*A,t[3]=(h*l*r-a*d*r-h*s*c+n*d*c+a*s*p-n*l*p)*A,t[4]=x*A,t[5]=(u*m*r-g*d*r+g*s*p-e*m*p-u*s*f+e*d*f)*A,t[6]=(g*l*r-o*m*r-g*s*c+e*m*c+o*s*f-e*l*f)*A,t[7]=(o*d*r-u*l*r+u*s*c-e*d*c-o*s*p+e*l*p)*A,t[8]=T*A,t[9]=(g*h*r-u*_*r-g*n*p+e*_*p+u*n*f-e*h*f)*A,t[10]=(o*_*r-g*a*r+g*n*c-e*_*c-o*n*f+e*a*f)*A,t[11]=(u*a*r-o*h*r-u*n*c+e*h*c+o*n*p-e*a*p)*A,t[12]=P*A,t[13]=(u*_*s-g*h*s+g*n*d-e*_*d-u*n*m+e*h*m)*A,t[14]=(g*a*s-o*_*s-g*n*l+e*_*l+o*n*m-e*a*m)*A,t[15]=(o*h*s-u*a*s+u*n*l-e*h*l-o*n*d+e*a*d)*A,this}scale(t){const e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){const t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){const e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){const n=Math.cos(e),s=Math.sin(e),r=1-n,o=t.x,a=t.y,l=t.z,c=r*o,u=r*a;return this.set(c*o+n,c*a-s*l,c*l+s*a,0,c*a+s*l,u*a+n,u*l-s*o,0,c*l-s*a,u*l+s*o,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,o){return this.set(1,n,r,0,t,1,o,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){const s=this.elements,r=e._x,o=e._y,a=e._z,l=e._w,c=r+r,u=o+o,h=a+a,d=r*c,p=r*u,g=r*h,_=o*u,m=o*h,f=a*h,S=l*c,x=l*u,T=l*h,P=n.x,w=n.y,A=n.z;return s[0]=(1-(_+f))*P,s[1]=(p+T)*P,s[2]=(g-x)*P,s[3]=0,s[4]=(p-T)*w,s[5]=(1-(d+f))*w,s[6]=(m+S)*w,s[7]=0,s[8]=(g+x)*A,s[9]=(m-S)*A,s[10]=(1-(d+_))*A,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){const s=this.elements;let r=Ci.set(s[0],s[1],s[2]).length();const o=Ci.set(s[4],s[5],s[6]).length(),a=Ci.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),t.x=s[12],t.y=s[13],t.z=s[14],an.copy(this);const c=1/r,u=1/o,h=1/a;return an.elements[0]*=c,an.elements[1]*=c,an.elements[2]*=c,an.elements[4]*=u,an.elements[5]*=u,an.elements[6]*=u,an.elements[8]*=h,an.elements[9]*=h,an.elements[10]*=h,e.setFromRotationMatrix(an),n.x=r,n.y=o,n.z=a,this}makePerspective(t,e,n,s,r,o,a=Ln){const l=this.elements,c=2*r/(e-t),u=2*r/(n-s),h=(e+t)/(e-t),d=(n+s)/(n-s);let p,g;if(a===Ln)p=-(o+r)/(o-r),g=-2*o*r/(o-r);else if(a===Ir)p=-o/(o-r),g=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=h,l[12]=0,l[1]=0,l[5]=u,l[9]=d,l[13]=0,l[2]=0,l[6]=0,l[10]=p,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,n,s,r,o,a=Ln){const l=this.elements,c=1/(e-t),u=1/(n-s),h=1/(o-r),d=(e+t)*c,p=(n+s)*u;let g,_;if(a===Ln)g=(o+r)*h,_=-2*h;else if(a===Ir)g=r*h,_=-1*h;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-d,l[1]=0,l[5]=2*u,l[9]=0,l[13]=-p,l[2]=0,l[6]=0,l[10]=_,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){const e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}}const Ci=new C,an=new Jt,Ef=new C(0,0,0),Tf=new C(1,1,1),zn=new C,Ys=new C,Xe=new C,Dl=new Jt,Il=new gi;class Mn{constructor(t=0,e=0,n=0,s=Mn.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){const s=t.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],u=s[9],h=s[2],d=s[6],p=s[10];switch(e){case"XYZ":this._y=Math.asin(Re(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,p),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Re(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,r),this._z=0);break;case"ZXY":this._x=Math.asin(Re(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-h,p),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Re(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(d,p),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(Re(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-h,r)):(this._x=0,this._y=Math.atan2(a,p));break;case"XZY":this._z=Math.asin(-Re(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-u,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return Dl.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Dl,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Il.setFromEuler(this),this.setFromQuaternion(Il,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Mn.DEFAULT_ORDER="XYZ";class wo{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let wf=0;const Ul=new C,Ri=new gi,wn=new Jt,js=new C,fs=new C,Af=new C,Cf=new gi,Nl=new C(1,0,0),Ol=new C(0,1,0),Fl=new C(0,0,1),Bl={type:"added"},Rf={type:"removed"},Pi={type:"childadded",child:null},xa={type:"childremoved",child:null};class ce extends _i{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:wf++}),this.uuid=qn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=ce.DEFAULT_UP.clone();const t=new C,e=new Mn,n=new gi,s=new C(1,1,1);function r(){n.setFromEuler(e,!1)}function o(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Jt},normalMatrix:{value:new Ot}}),this.matrix=new Jt,this.matrixWorld=new Jt,this.matrixAutoUpdate=ce.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=ce.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new wo,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Ri.setFromAxisAngle(t,e),this.quaternion.multiply(Ri),this}rotateOnWorldAxis(t,e){return Ri.setFromAxisAngle(t,e),this.quaternion.premultiply(Ri),this}rotateX(t){return this.rotateOnAxis(Nl,t)}rotateY(t){return this.rotateOnAxis(Ol,t)}rotateZ(t){return this.rotateOnAxis(Fl,t)}translateOnAxis(t,e){return Ul.copy(t).applyQuaternion(this.quaternion),this.position.add(Ul.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Nl,t)}translateY(t){return this.translateOnAxis(Ol,t)}translateZ(t){return this.translateOnAxis(Fl,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(wn.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?js.copy(t):js.set(t,e,n);const s=this.parent;this.updateWorldMatrix(!0,!1),fs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?wn.lookAt(fs,js,this.up):wn.lookAt(js,fs,this.up),this.quaternion.setFromRotationMatrix(wn),s&&(wn.extractRotation(s.matrixWorld),Ri.setFromRotationMatrix(wn),this.quaternion.premultiply(Ri.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Bl),Pi.child=t,this.dispatchEvent(Pi),Pi.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(Rf),xa.child=t,this.dispatchEvent(xa),xa.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),wn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),wn.multiply(t.parent.matrixWorld)),t.applyMatrix4(wn),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Bl),Pi.child=t,this.dispatchEvent(Pi),Pi.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){const o=this.children[n].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(fs,t,Af),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(fs,Cf,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){const e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,t=!0);const e=this.children;for(let n=0,s=e.length;n<s;n++){const r=e[n];(r.matrixWorldAutoUpdate===!0||t===!0)&&r.updateMatrixWorld(t)}}updateWorldMatrix(t,e){const n=this.parent;if(t===!0&&n!==null&&n.matrixWorldAutoUpdate===!0&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),e===!0){const s=this.children;for(let r=0,o=s.length;r<o;r++){const a=s[r];a.matrixWorldAutoUpdate===!0&&a.updateWorldMatrix(!1,!0)}}}toJSON(t){const e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),s.maxGeometryCount=this._maxGeometryCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){const h=l[c];r(t.shapes,h)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(t.materials,this.material[l]));s.material=a}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];s.animations.push(r(t.animations,l))}}if(e){const a=o(t.geometries),l=o(t.materials),c=o(t.textures),u=o(t.images),h=o(t.shapes),d=o(t.skeletons),p=o(t.animations),g=o(t.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),h.length>0&&(n.shapes=h),d.length>0&&(n.skeletons=d),p.length>0&&(n.animations=p),g.length>0&&(n.nodes=g)}return n.object=s,n;function o(a){const l=[];for(const c in a){const u=a[c];delete u.metadata,l.push(u)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){const s=t.children[n];this.add(s.clone())}return this}}ce.DEFAULT_UP=new C(0,1,0);ce.DEFAULT_MATRIX_AUTO_UPDATE=!0;ce.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const on=new C,An=new C,ya=new C,Cn=new C,Li=new C,Di=new C,zl=new C,Ma=new C,Sa=new C,ba=new C;class hn{constructor(t=new C,e=new C,n=new C){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),on.subVectors(t,e),s.cross(on);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){on.subVectors(s,e),An.subVectors(n,e),ya.subVectors(t,e);const o=on.dot(on),a=on.dot(An),l=on.dot(ya),c=An.dot(An),u=An.dot(ya),h=o*c-a*a;if(h===0)return r.set(0,0,0),null;const d=1/h,p=(c*l-a*u)*d,g=(o*u-a*l)*d;return r.set(1-p-g,g,p)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,Cn)===null?!1:Cn.x>=0&&Cn.y>=0&&Cn.x+Cn.y<=1}static getInterpolation(t,e,n,s,r,o,a,l){return this.getBarycoord(t,e,n,s,Cn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Cn.x),l.addScaledVector(o,Cn.y),l.addScaledVector(a,Cn.z),l)}static isFrontFacing(t,e,n,s){return on.subVectors(n,e),An.subVectors(t,e),on.cross(An).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return on.subVectors(this.c,this.b),An.subVectors(this.a,this.b),on.cross(An).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return hn.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return hn.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return hn.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return hn.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return hn.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){const n=this.a,s=this.b,r=this.c;let o,a;Li.subVectors(s,n),Di.subVectors(r,n),Ma.subVectors(t,n);const l=Li.dot(Ma),c=Di.dot(Ma);if(l<=0&&c<=0)return e.copy(n);Sa.subVectors(t,s);const u=Li.dot(Sa),h=Di.dot(Sa);if(u>=0&&h<=u)return e.copy(s);const d=l*h-u*c;if(d<=0&&l>=0&&u<=0)return o=l/(l-u),e.copy(n).addScaledVector(Li,o);ba.subVectors(t,r);const p=Li.dot(ba),g=Di.dot(ba);if(g>=0&&p<=g)return e.copy(r);const _=p*c-l*g;if(_<=0&&c>=0&&g<=0)return a=c/(c-g),e.copy(n).addScaledVector(Di,a);const m=u*g-p*h;if(m<=0&&h-u>=0&&p-g>=0)return zl.subVectors(r,s),a=(h-u)/(h-u+(p-g)),e.copy(s).addScaledVector(zl,a);const f=1/(m+_+d);return o=_*f,a=d*f,e.copy(n).addScaledVector(Li,o).addScaledVector(Di,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}const Mu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},kn={h:0,s:0,l:0},Ks={h:0,s:0,l:0};function Ea(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}class St{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){const s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=tn){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,te.toWorkingColorSpace(this,e),this}setRGB(t,e,n,s=te.workingColorSpace){return this.r=t,this.g=e,this.b=n,te.toWorkingColorSpace(this,s),this}setHSL(t,e,n,s=te.workingColorSpace){if(t=ff(t,1),e=Re(e,0,1),n=Re(n,0,1),e===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+e):n+e-n*e,o=2*n-r;this.r=Ea(o,r,t+1/3),this.g=Ea(o,r,t),this.b=Ea(o,r,t-1/3)}return te.toWorkingColorSpace(this,s),this}setStyle(t,e=tn){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r;const o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){const r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(r,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=tn){const n=Mu[t.toLowerCase()];return n!==void 0?this.setHex(n,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=es(t.r),this.g=es(t.g),this.b=es(t.b),this}copyLinearToSRGB(t){return this.r=ha(t.r),this.g=ha(t.g),this.b=ha(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=tn){return te.fromWorkingColorSpace(Ie.copy(this),t),Math.round(Re(Ie.r*255,0,255))*65536+Math.round(Re(Ie.g*255,0,255))*256+Math.round(Re(Ie.b*255,0,255))}getHexString(t=tn){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=te.workingColorSpace){te.fromWorkingColorSpace(Ie.copy(this),e);const n=Ie.r,s=Ie.g,r=Ie.b,o=Math.max(n,s,r),a=Math.min(n,s,r);let l,c;const u=(a+o)/2;if(a===o)l=0,c=0;else{const h=o-a;switch(c=u<=.5?h/(o+a):h/(2-o-a),o){case n:l=(s-r)/h+(s<r?6:0);break;case s:l=(r-n)/h+2;break;case r:l=(n-s)/h+4;break}l/=6}return t.h=l,t.s=c,t.l=u,t}getRGB(t,e=te.workingColorSpace){return te.fromWorkingColorSpace(Ie.copy(this),e),t.r=Ie.r,t.g=Ie.g,t.b=Ie.b,t}getStyle(t=tn){te.fromWorkingColorSpace(Ie.copy(this),t);const e=Ie.r,n=Ie.g,s=Ie.b;return t!==tn?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(kn),this.setHSL(kn.h+t,kn.s+e,kn.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(kn),t.getHSL(Ks);const n=ca(kn.h,Ks.h,e),s=ca(kn.s,Ks.s,e),r=ca(kn.l,Ks.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Ie=new St;St.NAMES=Mu;let Pf=0;class Zn extends _i{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Pf++}),this.uuid=qn(),this.name="",this.type="Material",this.blending=Qi,this.side=Yn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=no,this.blendDst=io,this.blendEquation=li,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new St(0,0,0),this.blendAlpha=0,this.depthFunc=Cr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=wl,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=bi,this.stencilZFail=bi,this.stencilZPass=bi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBuild(){}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const e in t){const n=t[e];if(n===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}const s=this[e];if(s===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){const e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Qi&&(n.blending=this.blending),this.side!==Yn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==no&&(n.blendSrc=this.blendSrc),this.blendDst!==io&&(n.blendDst=this.blendDst),this.blendEquation!==li&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Cr&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==wl&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==bi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==bi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==bi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const o=[];for(const a in r){const l=r[a];delete l.metadata,o.push(l)}return o}if(e){const r=s(t.textures),o=s(t.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const e=t.clippingPlanes;let n=null;if(e!==null){const s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}}class ke extends Zn{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new St(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Mn,this.combine=nu,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const Me=new C,Zs=new tt;class Pe{constructor(t,e,n=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=oo,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.gpuType=Pn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}get updateRange(){return To("THREE.BufferAttribute: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)Zs.fromBufferAttribute(this,e),Zs.applyMatrix3(t),this.setXY(e,Zs.x,Zs.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)Me.fromBufferAttribute(this,e),Me.applyMatrix3(t),this.setXYZ(e,Me.x,Me.y,Me.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)Me.fromBufferAttribute(this,e),Me.applyMatrix4(t),this.setXYZ(e,Me.x,Me.y,Me.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Me.fromBufferAttribute(this,e),Me.applyNormalMatrix(t),this.setXYZ(e,Me.x,Me.y,Me.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Me.fromBufferAttribute(this,e),Me.transformDirection(t),this.setXYZ(e,Me.x,Me.y,Me.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=xn(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=se(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=xn(e,this.array)),e}setX(t,e){return this.normalized&&(e=se(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=xn(e,this.array)),e}setY(t,e){return this.normalized&&(e=se(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=xn(e,this.array)),e}setZ(t,e){return this.normalized&&(e=se(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=xn(e,this.array)),e}setW(t,e){return this.normalized&&(e=se(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=se(e,this.array),n=se(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=se(e,this.array),n=se(n,this.array),s=se(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=se(e,this.array),n=se(n,this.array),s=se(s,this.array),r=se(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==oo&&(t.usage=this.usage),t}}class Su extends Pe{constructor(t,e,n){super(new Uint16Array(t),e,n)}}class bu extends Pe{constructor(t,e,n){super(new Uint32Array(t),e,n)}}class zt extends Pe{constructor(t,e,n){super(new Float32Array(t),e,n)}}let Lf=0;const Ze=new Jt,Ta=new ce,Ii=new C,$e=new xi,ps=new xi,Te=new C;class qt extends _i{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Lf++}),this.uuid=qn(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(_u(t)?bu:Su)(t,1):this.index=t,this}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){const e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Ot().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return Ze.makeRotationFromQuaternion(t),this.applyMatrix4(Ze),this}rotateX(t){return Ze.makeRotationX(t),this.applyMatrix4(Ze),this}rotateY(t){return Ze.makeRotationY(t),this.applyMatrix4(Ze),this}rotateZ(t){return Ze.makeRotationZ(t),this.applyMatrix4(Ze),this}translate(t,e,n){return Ze.makeTranslation(t,e,n),this.applyMatrix4(Ze),this}scale(t,e,n){return Ze.makeScale(t,e,n),this.applyMatrix4(Ze),this}lookAt(t){return Ta.lookAt(t),Ta.updateMatrix(),this.applyMatrix4(Ta.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ii).negate(),this.translate(Ii.x,Ii.y,Ii.z),this}setFromPoints(t){const e=[];for(let n=0,s=t.length;n<s;n++){const r=t[n];e.push(r.x,r.y,r.z||0)}return this.setAttribute("position",new zt(e,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new xi);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new C(-1/0,-1/0,-1/0),new C(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){const r=e[n];$e.setFromBufferAttribute(r),this.morphTargetsRelative?(Te.addVectors(this.boundingBox.min,$e.min),this.boundingBox.expandByPoint(Te),Te.addVectors(this.boundingBox.max,$e.max),this.boundingBox.expandByPoint(Te)):(this.boundingBox.expandByPoint($e.min),this.boundingBox.expandByPoint($e.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new yi);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new C,1/0);return}if(t){const n=this.boundingSphere.center;if($e.setFromBufferAttribute(t),e)for(let r=0,o=e.length;r<o;r++){const a=e[r];ps.setFromBufferAttribute(a),this.morphTargetsRelative?(Te.addVectors($e.min,ps.min),$e.expandByPoint(Te),Te.addVectors($e.max,ps.max),$e.expandByPoint(Te)):($e.expandByPoint(ps.min),$e.expandByPoint(ps.max))}$e.getCenter(n);let s=0;for(let r=0,o=t.count;r<o;r++)Te.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(Te));if(e)for(let r=0,o=e.length;r<o;r++){const a=e[r],l=this.morphTargetsRelative;for(let c=0,u=a.count;c<u;c++)Te.fromBufferAttribute(a,c),l&&(Ii.fromBufferAttribute(t,c),Te.add(Ii)),s=Math.max(s,n.distanceToSquared(Te))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=e.position,s=e.normal,r=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Pe(new Float32Array(4*n.count),4));const o=this.getAttribute("tangent"),a=[],l=[];for(let I=0;I<n.count;I++)a[I]=new C,l[I]=new C;const c=new C,u=new C,h=new C,d=new tt,p=new tt,g=new tt,_=new C,m=new C;function f(I,E,y){c.fromBufferAttribute(n,I),u.fromBufferAttribute(n,E),h.fromBufferAttribute(n,y),d.fromBufferAttribute(r,I),p.fromBufferAttribute(r,E),g.fromBufferAttribute(r,y),u.sub(c),h.sub(c),p.sub(d),g.sub(d);const L=1/(p.x*g.y-g.x*p.y);isFinite(L)&&(_.copy(u).multiplyScalar(g.y).addScaledVector(h,-p.y).multiplyScalar(L),m.copy(h).multiplyScalar(p.x).addScaledVector(u,-g.x).multiplyScalar(L),a[I].add(_),a[E].add(_),a[y].add(_),l[I].add(m),l[E].add(m),l[y].add(m))}let S=this.groups;S.length===0&&(S=[{start:0,count:t.count}]);for(let I=0,E=S.length;I<E;++I){const y=S[I],L=y.start,B=y.count;for(let z=L,$=L+B;z<$;z+=3)f(t.getX(z+0),t.getX(z+1),t.getX(z+2))}const x=new C,T=new C,P=new C,w=new C;function A(I){P.fromBufferAttribute(s,I),w.copy(P);const E=a[I];x.copy(E),x.sub(P.multiplyScalar(P.dot(E))).normalize(),T.crossVectors(w,E);const L=T.dot(l[I])<0?-1:1;o.setXYZW(I,x.x,x.y,x.z,L)}for(let I=0,E=S.length;I<E;++I){const y=S[I],L=y.start,B=y.count;for(let z=L,$=L+B;z<$;z+=3)A(t.getX(z+0)),A(t.getX(z+1)),A(t.getX(z+2))}}computeVertexNormals(){const t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Pe(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let d=0,p=n.count;d<p;d++)n.setXYZ(d,0,0,0);const s=new C,r=new C,o=new C,a=new C,l=new C,c=new C,u=new C,h=new C;if(t)for(let d=0,p=t.count;d<p;d+=3){const g=t.getX(d+0),_=t.getX(d+1),m=t.getX(d+2);s.fromBufferAttribute(e,g),r.fromBufferAttribute(e,_),o.fromBufferAttribute(e,m),u.subVectors(o,r),h.subVectors(s,r),u.cross(h),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,m),a.add(u),l.add(u),c.add(u),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let d=0,p=e.count;d<p;d+=3)s.fromBufferAttribute(e,d+0),r.fromBufferAttribute(e,d+1),o.fromBufferAttribute(e,d+2),u.subVectors(o,r),h.subVectors(s,r),u.cross(h),n.setXYZ(d+0,u.x,u.y,u.z),n.setXYZ(d+1,u.x,u.y,u.z),n.setXYZ(d+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)Te.fromBufferAttribute(t,e),Te.normalize(),t.setXYZ(e,Te.x,Te.y,Te.z)}toNonIndexed(){function t(a,l){const c=a.array,u=a.itemSize,h=a.normalized,d=new c.constructor(l.length*u);let p=0,g=0;for(let _=0,m=l.length;_<m;_++){a.isInterleavedBufferAttribute?p=l[_]*a.data.stride+a.offset:p=l[_]*u;for(let f=0;f<u;f++)d[g++]=c[p++]}return new Pe(d,u,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const e=new qt,n=this.index.array,s=this.attributes;for(const a in s){const l=s[a],c=t(l,n);e.setAttribute(a,c)}const r=this.morphAttributes;for(const a in r){const l=[],c=r[a];for(let u=0,h=c.length;u<h;u++){const d=c[u],p=t(d,n);l.push(p)}e.morphAttributes[a]=l}e.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){const t={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};const e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});const n=this.attributes;for(const l in n){const c=n[l];t.data.attributes[l]=c.toJSON(t.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],u=[];for(let h=0,d=c.length;h<d;h++){const p=c[h];u.push(p.toJSON(t.data))}u.length>0&&(s[l]=u,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(t.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const e={};this.name=t.name;const n=t.index;n!==null&&this.setIndex(n.clone(e));const s=t.attributes;for(const c in s){const u=s[c];this.setAttribute(c,u.clone(e))}const r=t.morphAttributes;for(const c in r){const u=[],h=r[c];for(let d=0,p=h.length;d<p;d++)u.push(h[d].clone(e));this.morphAttributes[c]=u}this.morphTargetsRelative=t.morphTargetsRelative;const o=t.groups;for(let c=0,u=o.length;c<u;c++){const h=o[c];this.addGroup(h.start,h.count,h.materialIndex)}const a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const kl=new Jt,ii=new Os,Js=new yi,Hl=new C,Ui=new C,Ni=new C,Oi=new C,wa=new C,Qs=new C,tr=new tt,er=new tt,nr=new tt,Gl=new C,Vl=new C,Wl=new C,ir=new C,sr=new C;class xt extends ce{constructor(t=new qt,e=new ke){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(t,e){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;e.fromBufferAttribute(s,t);const a=this.morphTargetInfluences;if(r&&a){Qs.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const u=a[l],h=r[l];u!==0&&(wa.fromBufferAttribute(h,t),o?Qs.addScaledVector(wa,u):Qs.addScaledVector(wa.sub(e),u))}e.add(Qs)}return e}raycast(t,e){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Js.copy(n.boundingSphere),Js.applyMatrix4(r),ii.copy(t.ray).recast(t.near),!(Js.containsPoint(ii.origin)===!1&&(ii.intersectSphere(Js,Hl)===null||ii.origin.distanceToSquared(Hl)>(t.far-t.near)**2))&&(kl.copy(r).invert(),ii.copy(t.ray).applyMatrix4(kl),!(n.boundingBox!==null&&ii.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,ii)))}_computeIntersections(t,e,n){let s;const r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,h=r.attributes.normal,d=r.groups,p=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,_=d.length;g<_;g++){const m=d[g],f=o[m.materialIndex],S=Math.max(m.start,p.start),x=Math.min(a.count,Math.min(m.start+m.count,p.start+p.count));for(let T=S,P=x;T<P;T+=3){const w=a.getX(T),A=a.getX(T+1),I=a.getX(T+2);s=rr(this,f,t,n,c,u,h,w,A,I),s&&(s.faceIndex=Math.floor(T/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{const g=Math.max(0,p.start),_=Math.min(a.count,p.start+p.count);for(let m=g,f=_;m<f;m+=3){const S=a.getX(m),x=a.getX(m+1),T=a.getX(m+2);s=rr(this,o,t,n,c,u,h,S,x,T),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,_=d.length;g<_;g++){const m=d[g],f=o[m.materialIndex],S=Math.max(m.start,p.start),x=Math.min(l.count,Math.min(m.start+m.count,p.start+p.count));for(let T=S,P=x;T<P;T+=3){const w=T,A=T+1,I=T+2;s=rr(this,f,t,n,c,u,h,w,A,I),s&&(s.faceIndex=Math.floor(T/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{const g=Math.max(0,p.start),_=Math.min(l.count,p.start+p.count);for(let m=g,f=_;m<f;m+=3){const S=m,x=m+1,T=m+2;s=rr(this,o,t,n,c,u,h,S,x,T),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}}}function Df(i,t,e,n,s,r,o,a){let l;if(t.side===Ue?l=n.intersectTriangle(o,r,s,!0,a):l=n.intersectTriangle(s,r,o,t.side===Yn,a),l===null)return null;sr.copy(a),sr.applyMatrix4(i.matrixWorld);const c=e.ray.origin.distanceTo(sr);return c<e.near||c>e.far?null:{distance:c,point:sr.clone(),object:i}}function rr(i,t,e,n,s,r,o,a,l,c){i.getVertexPosition(a,Ui),i.getVertexPosition(l,Ni),i.getVertexPosition(c,Oi);const u=Df(i,t,e,n,Ui,Ni,Oi,ir);if(u){s&&(tr.fromBufferAttribute(s,a),er.fromBufferAttribute(s,l),nr.fromBufferAttribute(s,c),u.uv=hn.getInterpolation(ir,Ui,Ni,Oi,tr,er,nr,new tt)),r&&(tr.fromBufferAttribute(r,a),er.fromBufferAttribute(r,l),nr.fromBufferAttribute(r,c),u.uv1=hn.getInterpolation(ir,Ui,Ni,Oi,tr,er,nr,new tt)),o&&(Gl.fromBufferAttribute(o,a),Vl.fromBufferAttribute(o,l),Wl.fromBufferAttribute(o,c),u.normal=hn.getInterpolation(ir,Ui,Ni,Oi,Gl,Vl,Wl,new C),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));const h={a,b:l,c,normal:new C,materialIndex:0};hn.getNormal(Ui,Ni,Oi,h.normal),u.face=h}return u}class le extends qt{constructor(t=1,e=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};const a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);const l=[],c=[],u=[],h=[];let d=0,p=0;g("z","y","x",-1,-1,n,e,t,o,r,0),g("z","y","x",1,-1,n,e,-t,o,r,1),g("x","z","y",1,1,t,n,e,s,o,2),g("x","z","y",1,-1,t,n,-e,s,o,3),g("x","y","z",1,-1,t,e,n,s,r,4),g("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new zt(c,3)),this.setAttribute("normal",new zt(u,3)),this.setAttribute("uv",new zt(h,2));function g(_,m,f,S,x,T,P,w,A,I,E){const y=T/A,L=P/I,B=T/2,z=P/2,$=w/2,Y=A+1,W=I+1;let j=0,X=0;const ht=new C;for(let dt=0;dt<W;dt++){const gt=dt*L-z;for(let Gt=0;Gt<Y;Gt++){const Yt=Gt*y-B;ht[_]=Yt*S,ht[m]=gt*x,ht[f]=$,c.push(ht.x,ht.y,ht.z),ht[_]=0,ht[m]=0,ht[f]=w>0?1:-1,u.push(ht.x,ht.y,ht.z),h.push(Gt/A),h.push(1-dt/I),j+=1}}for(let dt=0;dt<I;dt++)for(let gt=0;gt<A;gt++){const Gt=d+gt+Y*dt,Yt=d+gt+Y*(dt+1),q=d+(gt+1)+Y*(dt+1),et=d+(gt+1)+Y*dt;l.push(Gt,Yt,et),l.push(Yt,q,et),X+=6}a.addGroup(p,X,E),p+=X,d+=j}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new le(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}function os(i){const t={};for(const e in i){t[e]={};for(const n in i[e]){const s=i[e][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone():Array.isArray(s)?t[e][n]=s.slice():t[e][n]=s}}return t}function Be(i){const t={};for(let e=0;e<i.length;e++){const n=os(i[e]);for(const s in n)t[s]=n[s]}return t}function If(i){const t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function Eu(i){const t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:te.workingColorSpace}const Ds={clone:os,merge:Be};var Uf=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Nf=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Le extends Zn{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Uf,this.fragmentShader=Nf,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=os(t.uniforms),this.uniformsGroups=If(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){const e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(const s in this.uniforms){const o=this.uniforms[s].value;o&&o.isTexture?e.uniforms[s]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[s]={type:"m4",value:o.toArray()}:e.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}}class Tu extends ce{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Jt,this.projectionMatrix=new Jt,this.projectionMatrixInverse=new Jt,this.coordinateSystem=Ln}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Hn=new C,Xl=new tt,$l=new tt;class nn extends Tu{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const e=.5*this.getFilmHeight()/t;this.fov=lo*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(Er*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return lo*2*Math.atan(Math.tan(Er*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){Hn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(Hn.x,Hn.y).multiplyScalar(-t/Hn.z),Hn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Hn.x,Hn.y).multiplyScalar(-t/Hn.z)}getViewSize(t,e){return this.getViewBounds(t,Xl,$l),e.subVectors($l,Xl)}setViewOffset(t,e,n,s,r,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let e=t*Math.tan(Er*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,e-=o.offsetY*n/c,s*=o.width/l,n*=o.height/c}const a=this.filmOffset;a!==0&&(r+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}const Fi=-90,Bi=1;class Of extends ce{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new nn(Fi,Bi,t,e);s.layers=this.layers,this.add(s);const r=new nn(Fi,Bi,t,e);r.layers=this.layers,this.add(r);const o=new nn(Fi,Bi,t,e);o.layers=this.layers,this.add(o);const a=new nn(Fi,Bi,t,e);a.layers=this.layers,this.add(a);const l=new nn(Fi,Bi,t,e);l.layers=this.layers,this.add(l);const c=new nn(Fi,Bi,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const t=this.coordinateSystem,e=this.children.concat(),[n,s,r,o,a,l]=e;for(const c of e)this.remove(c);if(t===Ln)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===Ir)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[r,o,a,l,c,u]=this.children,h=t.getRenderTarget(),d=t.getActiveCubeFace(),p=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;const _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,t.setRenderTarget(n,0,s),t.render(e,r),t.setRenderTarget(n,1,s),t.render(e,o),t.setRenderTarget(n,2,s),t.render(e,a),t.setRenderTarget(n,3,s),t.render(e,l),t.setRenderTarget(n,4,s),t.render(e,c),n.texture.generateMipmaps=_,t.setRenderTarget(n,5,s),t.render(e,u),t.setRenderTarget(h,d,p),t.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class wu extends Ne{constructor(t,e,n,s,r,o,a,l,c,u){t=t!==void 0?t:[],e=e!==void 0?e:ns,super(t,e,n,s,r,o,a,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class Ff extends dn{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;const n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new wu(s,e.mapping,e.wrapS,e.wrapT,e.magFilter,e.minFilter,e.format,e.type,e.anisotropy,e.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=e.generateMipmaps!==void 0?e.generateMipmaps:!1,this.texture.minFilter=e.minFilter!==void 0?e.minFilter:un}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new le(5,5,5),r=new Le({name:"CubemapFromEquirect",uniforms:os(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Ue,blending:Dn});r.uniforms.tEquirect.value=e;const o=new xt(s,r),a=e.minFilter;return e.minFilter===hi&&(e.minFilter=un),new Of(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e,n,s){const r=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,n,s);t.setRenderTarget(r)}}const Aa=new C,Bf=new C,zf=new Ot;class Gn{constructor(t=new C(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){const s=Aa.subVectors(n,e).cross(Bf.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){const n=t.delta(Aa),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;const r=-(t.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:e.copy(t.start).addScaledVector(n,r)}intersectsLine(t){const e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){const n=e||zf.getNormalMatrix(t),s=this.coplanarPoint(Aa).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}}const si=new yi,ar=new C;class Ao{constructor(t=new Gn,e=new Gn,n=new Gn,s=new Gn,r=new Gn,o=new Gn){this.planes=[t,e,n,s,r,o]}set(t,e,n,s,r,o){const a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(t){const e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=Ln){const n=this.planes,s=t.elements,r=s[0],o=s[1],a=s[2],l=s[3],c=s[4],u=s[5],h=s[6],d=s[7],p=s[8],g=s[9],_=s[10],m=s[11],f=s[12],S=s[13],x=s[14],T=s[15];if(n[0].setComponents(l-r,d-c,m-p,T-f).normalize(),n[1].setComponents(l+r,d+c,m+p,T+f).normalize(),n[2].setComponents(l+o,d+u,m+g,T+S).normalize(),n[3].setComponents(l-o,d-u,m-g,T-S).normalize(),n[4].setComponents(l-a,d-h,m-_,T-x).normalize(),e===Ln)n[5].setComponents(l+a,d+h,m+_,T+x).normalize();else if(e===Ir)n[5].setComponents(a,h,_,x).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),si.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),si.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(si)}intersectsSprite(t){return si.center.set(0,0,0),si.radius=.7071067811865476,si.applyMatrix4(t.matrixWorld),this.intersectsSphere(si)}intersectsSphere(t){const e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){const e=this.planes;for(let n=0;n<6;n++){const s=e[n];if(ar.x=s.normal.x>0?t.max.x:t.min.x,ar.y=s.normal.y>0?t.max.y:t.min.y,ar.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(ar)<0)return!1}return!0}containsPoint(t){const e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function Au(){let i=null,t=!1,e=null,n=null;function s(r,o){e(r,o),n=i.requestAnimationFrame(s)}return{start:function(){t!==!0&&e!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function kf(i){const t=new WeakMap;function e(a,l){const c=a.array,u=a.usage,h=c.byteLength,d=i.createBuffer();i.bindBuffer(l,d),i.bufferData(l,c,u),a.onUploadCallback();let p;if(c instanceof Float32Array)p=i.FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?p=i.HALF_FLOAT:p=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=i.SHORT;else if(c instanceof Uint32Array)p=i.UNSIGNED_INT;else if(c instanceof Int32Array)p=i.INT;else if(c instanceof Int8Array)p=i.BYTE;else if(c instanceof Uint8Array)p=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:h}}function n(a,l,c){const u=l.array,h=l._updateRange,d=l.updateRanges;if(i.bindBuffer(c,a),h.count===-1&&d.length===0&&i.bufferSubData(c,0,u),d.length!==0){for(let p=0,g=d.length;p<g;p++){const _=d[p];i.bufferSubData(c,_.start*u.BYTES_PER_ELEMENT,u,_.start,_.count)}l.clearUpdateRanges()}h.count!==-1&&(i.bufferSubData(c,h.offset*u.BYTES_PER_ELEMENT,u,h.offset,h.count),h.count=-1),l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),t.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);const l=t.get(a);l&&(i.deleteBuffer(l.buffer),t.delete(a))}function o(a,l){if(a.isGLBufferAttribute){const u=t.get(a);(!u||u.version<a.version)&&t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}a.isInterleavedBufferAttribute&&(a=a.data);const c=t.get(a);if(c===void 0)t.set(a,e(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}class pi extends qt{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};const r=t/2,o=e/2,a=Math.floor(n),l=Math.floor(s),c=a+1,u=l+1,h=t/a,d=e/l,p=[],g=[],_=[],m=[];for(let f=0;f<u;f++){const S=f*d-o;for(let x=0;x<c;x++){const T=x*h-r;g.push(T,-S,0),_.push(0,0,1),m.push(x/a),m.push(1-f/l)}}for(let f=0;f<l;f++)for(let S=0;S<a;S++){const x=S+c*f,T=S+c*(f+1),P=S+1+c*(f+1),w=S+1+c*f;p.push(x,T,w),p.push(T,P,w)}this.setIndex(p),this.setAttribute("position",new zt(g,3)),this.setAttribute("normal",new zt(_,3)),this.setAttribute("uv",new zt(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new pi(t.width,t.height,t.widthSegments,t.heightSegments)}}var Hf=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Gf=`#ifdef USE_ALPHAHASH
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
#endif`,Vf=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Wf=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Xf=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,$f=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,qf=`#ifdef USE_AOMAP
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
#endif`,Yf=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,jf=`#ifdef USE_BATCHING
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
#endif`,Kf=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( batchId );
#endif`,Zf=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Jf=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Qf=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,tp=`#ifdef USE_IRIDESCENCE
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
#endif`,ep=`#ifdef USE_BUMPMAP
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
#endif`,np=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,ip=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,sp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,rp=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,ap=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,op=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,lp=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,cp=`#if defined( USE_COLOR_ALPHA )
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
#endif`,up=`#define PI 3.141592653589793
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
} // validated`,hp=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,dp=`vec3 transformedNormal = objectNormal;
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
#endif`,fp=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,pp=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,mp=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,gp=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,vp="gl_FragColor = linearToOutputTexel( gl_FragColor );",_p=`
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
}`,xp=`#ifdef USE_ENVMAP
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
#endif`,yp=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Mp=`#ifdef USE_ENVMAP
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
#endif`,Sp=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,bp=`#ifdef USE_ENVMAP
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
#endif`,Ep=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Tp=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,wp=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Ap=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Cp=`#ifdef USE_GRADIENTMAP
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
}`,Rp=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Pp=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Lp=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Dp=`uniform bool receiveShadow;
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
#endif`,Ip=`#ifdef USE_ENVMAP
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
#endif`,Up=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Np=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Op=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Fp=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Bp=`PhysicalMaterial material;
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
#endif`,zp=`struct PhysicalMaterial {
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
}`,kp=`
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
#endif`,Hp=`#if defined( RE_IndirectDiffuse )
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
#endif`,Gp=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Vp=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Wp=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Xp=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,$p=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,qp=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Yp=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,jp=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Kp=`#if defined( USE_POINTS_UV )
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
#endif`,Zp=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Jp=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Qp=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,tm=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,em=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,nm=`#ifdef USE_MORPHTARGETS
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
#endif`,im=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,sm=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,rm=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,am=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,om=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,lm=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,cm=`#ifdef USE_NORMALMAP
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
#endif`,um=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,hm=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,dm=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,fm=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,pm=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,mm=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,gm=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,vm=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,_m=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,xm=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,ym=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Mm=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Sm=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,bm=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Em=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Tm=`float getShadowMask() {
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
}`,wm=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Am=`#ifdef USE_SKINNING
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
#endif`,Cm=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Rm=`#ifdef USE_SKINNING
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
#endif`,Pm=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Lm=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Dm=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Im=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,Um=`#ifdef USE_TRANSMISSION
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
#endif`,Nm=`#ifdef USE_TRANSMISSION
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
#endif`,Om=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Fm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Bm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,zm=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const km=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Hm=`uniform sampler2D t2D;
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
}`,Gm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Vm=`#ifdef ENVMAP_TYPE_CUBE
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
}`,Wm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Xm=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,$m=`#include <common>
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
}`,qm=`#if DEPTH_PACKING == 3200
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
}`,Ym=`#define DISTANCE
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
}`,jm=`#define DISTANCE
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
}`,Km=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Zm=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Jm=`uniform float scale;
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
}`,Qm=`uniform vec3 diffuse;
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
}`,tg=`#include <common>
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
}`,eg=`uniform vec3 diffuse;
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
}`,ng=`#define LAMBERT
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
}`,ig=`#define LAMBERT
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
}`,sg=`#define MATCAP
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
}`,rg=`#define MATCAP
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
}`,ag=`#define NORMAL
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
}`,og=`#define NORMAL
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
}`,lg=`#define PHONG
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
}`,cg=`#define PHONG
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
}`,ug=`#define STANDARD
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
}`,hg=`#define STANDARD
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
}`,dg=`#define TOON
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
}`,fg=`#define TOON
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
}`,pg=`uniform float size;
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
}`,mg=`uniform vec3 diffuse;
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
}`,gg=`#include <common>
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
}`,vg=`uniform vec3 color;
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
}`,_g=`uniform float rotation;
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
}`,xg=`uniform vec3 diffuse;
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
}`,Nt={alphahash_fragment:Hf,alphahash_pars_fragment:Gf,alphamap_fragment:Vf,alphamap_pars_fragment:Wf,alphatest_fragment:Xf,alphatest_pars_fragment:$f,aomap_fragment:qf,aomap_pars_fragment:Yf,batching_pars_vertex:jf,batching_vertex:Kf,begin_vertex:Zf,beginnormal_vertex:Jf,bsdfs:Qf,iridescence_fragment:tp,bumpmap_pars_fragment:ep,clipping_planes_fragment:np,clipping_planes_pars_fragment:ip,clipping_planes_pars_vertex:sp,clipping_planes_vertex:rp,color_fragment:ap,color_pars_fragment:op,color_pars_vertex:lp,color_vertex:cp,common:up,cube_uv_reflection_fragment:hp,defaultnormal_vertex:dp,displacementmap_pars_vertex:fp,displacementmap_vertex:pp,emissivemap_fragment:mp,emissivemap_pars_fragment:gp,colorspace_fragment:vp,colorspace_pars_fragment:_p,envmap_fragment:xp,envmap_common_pars_fragment:yp,envmap_pars_fragment:Mp,envmap_pars_vertex:Sp,envmap_physical_pars_fragment:Ip,envmap_vertex:bp,fog_vertex:Ep,fog_pars_vertex:Tp,fog_fragment:wp,fog_pars_fragment:Ap,gradientmap_pars_fragment:Cp,lightmap_pars_fragment:Rp,lights_lambert_fragment:Pp,lights_lambert_pars_fragment:Lp,lights_pars_begin:Dp,lights_toon_fragment:Up,lights_toon_pars_fragment:Np,lights_phong_fragment:Op,lights_phong_pars_fragment:Fp,lights_physical_fragment:Bp,lights_physical_pars_fragment:zp,lights_fragment_begin:kp,lights_fragment_maps:Hp,lights_fragment_end:Gp,logdepthbuf_fragment:Vp,logdepthbuf_pars_fragment:Wp,logdepthbuf_pars_vertex:Xp,logdepthbuf_vertex:$p,map_fragment:qp,map_pars_fragment:Yp,map_particle_fragment:jp,map_particle_pars_fragment:Kp,metalnessmap_fragment:Zp,metalnessmap_pars_fragment:Jp,morphinstance_vertex:Qp,morphcolor_vertex:tm,morphnormal_vertex:em,morphtarget_pars_vertex:nm,morphtarget_vertex:im,normal_fragment_begin:sm,normal_fragment_maps:rm,normal_pars_fragment:am,normal_pars_vertex:om,normal_vertex:lm,normalmap_pars_fragment:cm,clearcoat_normal_fragment_begin:um,clearcoat_normal_fragment_maps:hm,clearcoat_pars_fragment:dm,iridescence_pars_fragment:fm,opaque_fragment:pm,packing:mm,premultiplied_alpha_fragment:gm,project_vertex:vm,dithering_fragment:_m,dithering_pars_fragment:xm,roughnessmap_fragment:ym,roughnessmap_pars_fragment:Mm,shadowmap_pars_fragment:Sm,shadowmap_pars_vertex:bm,shadowmap_vertex:Em,shadowmask_pars_fragment:Tm,skinbase_vertex:wm,skinning_pars_vertex:Am,skinning_vertex:Cm,skinnormal_vertex:Rm,specularmap_fragment:Pm,specularmap_pars_fragment:Lm,tonemapping_fragment:Dm,tonemapping_pars_fragment:Im,transmission_fragment:Um,transmission_pars_fragment:Nm,uv_pars_fragment:Om,uv_pars_vertex:Fm,uv_vertex:Bm,worldpos_vertex:zm,background_vert:km,background_frag:Hm,backgroundCube_vert:Gm,backgroundCube_frag:Vm,cube_vert:Wm,cube_frag:Xm,depth_vert:$m,depth_frag:qm,distanceRGBA_vert:Ym,distanceRGBA_frag:jm,equirect_vert:Km,equirect_frag:Zm,linedashed_vert:Jm,linedashed_frag:Qm,meshbasic_vert:tg,meshbasic_frag:eg,meshlambert_vert:ng,meshlambert_frag:ig,meshmatcap_vert:sg,meshmatcap_frag:rg,meshnormal_vert:ag,meshnormal_frag:og,meshphong_vert:lg,meshphong_frag:cg,meshphysical_vert:ug,meshphysical_frag:hg,meshtoon_vert:dg,meshtoon_frag:fg,points_vert:pg,points_frag:mg,shadow_vert:gg,shadow_frag:vg,sprite_vert:_g,sprite_frag:xg},at={common:{diffuse:{value:new St(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ot},alphaMap:{value:null},alphaMapTransform:{value:new Ot},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ot}},envmap:{envMap:{value:null},envMapRotation:{value:new Ot},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ot}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ot}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ot},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ot},normalScale:{value:new tt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ot},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ot}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ot}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ot}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new St(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new St(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ot},alphaTest:{value:0},uvTransform:{value:new Ot}},sprite:{diffuse:{value:new St(16777215)},opacity:{value:1},center:{value:new tt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ot},alphaMap:{value:null},alphaMapTransform:{value:new Ot},alphaTest:{value:0}}},_n={basic:{uniforms:Be([at.common,at.specularmap,at.envmap,at.aomap,at.lightmap,at.fog]),vertexShader:Nt.meshbasic_vert,fragmentShader:Nt.meshbasic_frag},lambert:{uniforms:Be([at.common,at.specularmap,at.envmap,at.aomap,at.lightmap,at.emissivemap,at.bumpmap,at.normalmap,at.displacementmap,at.fog,at.lights,{emissive:{value:new St(0)}}]),vertexShader:Nt.meshlambert_vert,fragmentShader:Nt.meshlambert_frag},phong:{uniforms:Be([at.common,at.specularmap,at.envmap,at.aomap,at.lightmap,at.emissivemap,at.bumpmap,at.normalmap,at.displacementmap,at.fog,at.lights,{emissive:{value:new St(0)},specular:{value:new St(1118481)},shininess:{value:30}}]),vertexShader:Nt.meshphong_vert,fragmentShader:Nt.meshphong_frag},standard:{uniforms:Be([at.common,at.envmap,at.aomap,at.lightmap,at.emissivemap,at.bumpmap,at.normalmap,at.displacementmap,at.roughnessmap,at.metalnessmap,at.fog,at.lights,{emissive:{value:new St(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Nt.meshphysical_vert,fragmentShader:Nt.meshphysical_frag},toon:{uniforms:Be([at.common,at.aomap,at.lightmap,at.emissivemap,at.bumpmap,at.normalmap,at.displacementmap,at.gradientmap,at.fog,at.lights,{emissive:{value:new St(0)}}]),vertexShader:Nt.meshtoon_vert,fragmentShader:Nt.meshtoon_frag},matcap:{uniforms:Be([at.common,at.bumpmap,at.normalmap,at.displacementmap,at.fog,{matcap:{value:null}}]),vertexShader:Nt.meshmatcap_vert,fragmentShader:Nt.meshmatcap_frag},points:{uniforms:Be([at.points,at.fog]),vertexShader:Nt.points_vert,fragmentShader:Nt.points_frag},dashed:{uniforms:Be([at.common,at.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Nt.linedashed_vert,fragmentShader:Nt.linedashed_frag},depth:{uniforms:Be([at.common,at.displacementmap]),vertexShader:Nt.depth_vert,fragmentShader:Nt.depth_frag},normal:{uniforms:Be([at.common,at.bumpmap,at.normalmap,at.displacementmap,{opacity:{value:1}}]),vertexShader:Nt.meshnormal_vert,fragmentShader:Nt.meshnormal_frag},sprite:{uniforms:Be([at.sprite,at.fog]),vertexShader:Nt.sprite_vert,fragmentShader:Nt.sprite_frag},background:{uniforms:{uvTransform:{value:new Ot},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Nt.background_vert,fragmentShader:Nt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ot}},vertexShader:Nt.backgroundCube_vert,fragmentShader:Nt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Nt.cube_vert,fragmentShader:Nt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Nt.equirect_vert,fragmentShader:Nt.equirect_frag},distanceRGBA:{uniforms:Be([at.common,at.displacementmap,{referencePosition:{value:new C},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Nt.distanceRGBA_vert,fragmentShader:Nt.distanceRGBA_frag},shadow:{uniforms:Be([at.lights,at.fog,{color:{value:new St(0)},opacity:{value:1}}]),vertexShader:Nt.shadow_vert,fragmentShader:Nt.shadow_frag}};_n.physical={uniforms:Be([_n.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ot},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ot},clearcoatNormalScale:{value:new tt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ot},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ot},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ot},sheen:{value:0},sheenColor:{value:new St(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ot},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ot},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ot},transmissionSamplerSize:{value:new tt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ot},attenuationDistance:{value:0},attenuationColor:{value:new St(0)},specularColor:{value:new St(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ot},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ot},anisotropyVector:{value:new tt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ot}}]),vertexShader:Nt.meshphysical_vert,fragmentShader:Nt.meshphysical_frag};const or={r:0,b:0,g:0},ri=new Mn,yg=new Jt;function Mg(i,t,e,n,s,r,o){const a=new St(0);let l=r===!0?0:1,c,u,h=null,d=0,p=null;function g(S){let x=S.isScene===!0?S.background:null;return x&&x.isTexture&&(x=(S.backgroundBlurriness>0?e:t).get(x)),x}function _(S){let x=!1;const T=g(S);T===null?f(a,l):T&&T.isColor&&(f(T,1),x=!0);const P=i.xr.getEnvironmentBlendMode();P==="additive"?n.buffers.color.setClear(0,0,0,1,o):P==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(i.autoClear||x)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function m(S,x){const T=g(x);T&&(T.isCubeTexture||T.mapping===Vr)?(u===void 0&&(u=new xt(new le(1,1,1),new Le({name:"BackgroundCubeMaterial",uniforms:os(_n.backgroundCube.uniforms),vertexShader:_n.backgroundCube.vertexShader,fragmentShader:_n.backgroundCube.fragmentShader,side:Ue,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(P,w,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(u)),ri.copy(x.backgroundRotation),ri.x*=-1,ri.y*=-1,ri.z*=-1,T.isCubeTexture&&T.isRenderTargetTexture===!1&&(ri.y*=-1,ri.z*=-1),u.material.uniforms.envMap.value=T,u.material.uniforms.flipEnvMap.value=T.isCubeTexture&&T.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=x.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(yg.makeRotationFromEuler(ri)),u.material.toneMapped=te.getTransfer(T.colorSpace)!==oe,(h!==T||d!==T.version||p!==i.toneMapping)&&(u.material.needsUpdate=!0,h=T,d=T.version,p=i.toneMapping),u.layers.enableAll(),S.unshift(u,u.geometry,u.material,0,0,null)):T&&T.isTexture&&(c===void 0&&(c=new xt(new pi(2,2),new Le({name:"BackgroundMaterial",uniforms:os(_n.background.uniforms),vertexShader:_n.background.vertexShader,fragmentShader:_n.background.fragmentShader,side:Yn,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=T,c.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,c.material.toneMapped=te.getTransfer(T.colorSpace)!==oe,T.matrixAutoUpdate===!0&&T.updateMatrix(),c.material.uniforms.uvTransform.value.copy(T.matrix),(h!==T||d!==T.version||p!==i.toneMapping)&&(c.material.needsUpdate=!0,h=T,d=T.version,p=i.toneMapping),c.layers.enableAll(),S.unshift(c,c.geometry,c.material,0,0,null))}function f(S,x){S.getRGB(or,Eu(i)),n.buffers.color.setClear(or.r,or.g,or.b,x,o)}return{getClearColor:function(){return a},setClearColor:function(S,x=1){a.set(S),l=x,f(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(S){l=S,f(a,l)},render:_,addToRenderList:m}}function Sg(i,t){const e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=d(null);let r=s,o=!1;function a(y,L,B,z,$){let Y=!1;const W=h(z,B,L);r!==W&&(r=W,c(r.object)),Y=p(y,z,B,$),Y&&g(y,z,B,$),$!==null&&t.update($,i.ELEMENT_ARRAY_BUFFER),(Y||o)&&(o=!1,T(y,L,B,z),$!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get($).buffer))}function l(){return i.createVertexArray()}function c(y){return i.bindVertexArray(y)}function u(y){return i.deleteVertexArray(y)}function h(y,L,B){const z=B.wireframe===!0;let $=n[y.id];$===void 0&&($={},n[y.id]=$);let Y=$[L.id];Y===void 0&&(Y={},$[L.id]=Y);let W=Y[z];return W===void 0&&(W=d(l()),Y[z]=W),W}function d(y){const L=[],B=[],z=[];for(let $=0;$<e;$++)L[$]=0,B[$]=0,z[$]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:L,enabledAttributes:B,attributeDivisors:z,object:y,attributes:{},index:null}}function p(y,L,B,z){const $=r.attributes,Y=L.attributes;let W=0;const j=B.getAttributes();for(const X in j)if(j[X].location>=0){const dt=$[X];let gt=Y[X];if(gt===void 0&&(X==="instanceMatrix"&&y.instanceMatrix&&(gt=y.instanceMatrix),X==="instanceColor"&&y.instanceColor&&(gt=y.instanceColor)),dt===void 0||dt.attribute!==gt||gt&&dt.data!==gt.data)return!0;W++}return r.attributesNum!==W||r.index!==z}function g(y,L,B,z){const $={},Y=L.attributes;let W=0;const j=B.getAttributes();for(const X in j)if(j[X].location>=0){let dt=Y[X];dt===void 0&&(X==="instanceMatrix"&&y.instanceMatrix&&(dt=y.instanceMatrix),X==="instanceColor"&&y.instanceColor&&(dt=y.instanceColor));const gt={};gt.attribute=dt,dt&&dt.data&&(gt.data=dt.data),$[X]=gt,W++}r.attributes=$,r.attributesNum=W,r.index=z}function _(){const y=r.newAttributes;for(let L=0,B=y.length;L<B;L++)y[L]=0}function m(y){f(y,0)}function f(y,L){const B=r.newAttributes,z=r.enabledAttributes,$=r.attributeDivisors;B[y]=1,z[y]===0&&(i.enableVertexAttribArray(y),z[y]=1),$[y]!==L&&(i.vertexAttribDivisor(y,L),$[y]=L)}function S(){const y=r.newAttributes,L=r.enabledAttributes;for(let B=0,z=L.length;B<z;B++)L[B]!==y[B]&&(i.disableVertexAttribArray(B),L[B]=0)}function x(y,L,B,z,$,Y,W){W===!0?i.vertexAttribIPointer(y,L,B,$,Y):i.vertexAttribPointer(y,L,B,z,$,Y)}function T(y,L,B,z){_();const $=z.attributes,Y=B.getAttributes(),W=L.defaultAttributeValues;for(const j in Y){const X=Y[j];if(X.location>=0){let ht=$[j];if(ht===void 0&&(j==="instanceMatrix"&&y.instanceMatrix&&(ht=y.instanceMatrix),j==="instanceColor"&&y.instanceColor&&(ht=y.instanceColor)),ht!==void 0){const dt=ht.normalized,gt=ht.itemSize,Gt=t.get(ht);if(Gt===void 0)continue;const Yt=Gt.buffer,q=Gt.type,et=Gt.bytesPerElement,ft=q===i.INT||q===i.UNSIGNED_INT||ht.gpuType===cu;if(ht.isInterleavedBufferAttribute){const ot=ht.data,Ft=ot.stride,Pt=ht.offset;if(ot.isInstancedInterleavedBuffer){for(let Vt=0;Vt<X.locationSize;Vt++)f(X.location+Vt,ot.meshPerAttribute);y.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=ot.meshPerAttribute*ot.count)}else for(let Vt=0;Vt<X.locationSize;Vt++)m(X.location+Vt);i.bindBuffer(i.ARRAY_BUFFER,Yt);for(let Vt=0;Vt<X.locationSize;Vt++)x(X.location+Vt,gt/X.locationSize,q,dt,Ft*et,(Pt+gt/X.locationSize*Vt)*et,ft)}else{if(ht.isInstancedBufferAttribute){for(let ot=0;ot<X.locationSize;ot++)f(X.location+ot,ht.meshPerAttribute);y.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=ht.meshPerAttribute*ht.count)}else for(let ot=0;ot<X.locationSize;ot++)m(X.location+ot);i.bindBuffer(i.ARRAY_BUFFER,Yt);for(let ot=0;ot<X.locationSize;ot++)x(X.location+ot,gt/X.locationSize,q,dt,gt*et,gt/X.locationSize*ot*et,ft)}}else if(W!==void 0){const dt=W[j];if(dt!==void 0)switch(dt.length){case 2:i.vertexAttrib2fv(X.location,dt);break;case 3:i.vertexAttrib3fv(X.location,dt);break;case 4:i.vertexAttrib4fv(X.location,dt);break;default:i.vertexAttrib1fv(X.location,dt)}}}}S()}function P(){I();for(const y in n){const L=n[y];for(const B in L){const z=L[B];for(const $ in z)u(z[$].object),delete z[$];delete L[B]}delete n[y]}}function w(y){if(n[y.id]===void 0)return;const L=n[y.id];for(const B in L){const z=L[B];for(const $ in z)u(z[$].object),delete z[$];delete L[B]}delete n[y.id]}function A(y){for(const L in n){const B=n[L];if(B[y.id]===void 0)continue;const z=B[y.id];for(const $ in z)u(z[$].object),delete z[$];delete B[y.id]}}function I(){E(),o=!0,r!==s&&(r=s,c(r.object))}function E(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:I,resetDefaultState:E,dispose:P,releaseStatesOfGeometry:w,releaseStatesOfProgram:A,initAttributes:_,enableAttribute:m,disableUnusedAttributes:S}}function bg(i,t,e){let n;function s(c){n=c}function r(c,u){i.drawArrays(n,c,u),e.update(u,n,1)}function o(c,u,h){h!==0&&(i.drawArraysInstanced(n,c,u,h),e.update(u,n,h))}function a(c,u,h){if(h===0)return;const d=t.get("WEBGL_multi_draw");if(d===null)for(let p=0;p<h;p++)this.render(c[p],u[p]);else{d.multiDrawArraysWEBGL(n,c,0,u,0,h);let p=0;for(let g=0;g<h;g++)p+=u[g];e.update(p,n,1)}}function l(c,u,h,d){if(h===0)return;const p=t.get("WEBGL_multi_draw");if(p===null)for(let g=0;g<c.length;g++)o(c[g],u[g],d[g]);else{p.multiDrawArraysInstancedWEBGL(n,c,0,u,0,d,0,h);let g=0;for(let _=0;_<h;_++)g+=u[_];for(let _=0;_<d.length;_++)e.update(g,n,d[_])}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function Eg(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){const w=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(w){return!(w!==yn&&n.convert(w)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(w){const A=w===$n&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(w!==jn&&n.convert(w)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&w!==Pn&&!A)}function l(w){if(w==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";w="mediump"}return w==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp";const u=l(c);u!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);const h=e.logarithmicDepthBuffer===!0,d=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),p=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_TEXTURE_SIZE),_=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),m=i.getParameter(i.MAX_VERTEX_ATTRIBS),f=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),S=i.getParameter(i.MAX_VARYING_VECTORS),x=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),T=p>0,P=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:h,maxTextures:d,maxVertexTextures:p,maxTextureSize:g,maxCubemapSize:_,maxAttributes:m,maxVertexUniforms:f,maxVaryings:S,maxFragmentUniforms:x,vertexTextures:T,maxSamples:P}}function Tg(i){const t=this;let e=null,n=0,s=!1,r=!1;const o=new Gn,a=new Ot,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,d){const p=h.length!==0||d||n!==0||s;return s=d,n=h.length,p},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(h,d){e=u(h,d,0)},this.setState=function(h,d,p){const g=h.clippingPlanes,_=h.clipIntersection,m=h.clipShadows,f=i.get(h);if(!s||g===null||g.length===0||r&&!m)r?u(null):c();else{const S=r?0:n,x=S*4;let T=f.clippingState||null;l.value=T,T=u(g,d,x,p);for(let P=0;P!==x;++P)T[P]=e[P];f.clippingState=T,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=S}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function u(h,d,p,g){const _=h!==null?h.length:0;let m=null;if(_!==0){if(m=l.value,g!==!0||m===null){const f=p+_*4,S=d.matrixWorldInverse;a.getNormalMatrix(S),(m===null||m.length<f)&&(m=new Float32Array(f));for(let x=0,T=p;x!==_;++x,T+=4)o.copy(h[x]).applyMatrix4(S,a),o.normal.toArray(m,T),m[T+3]=o.constant}l.value=m,l.needsUpdate=!0}return t.numPlanes=_,t.numIntersection=0,m}}function wg(i){let t=new WeakMap;function e(o,a){return a===so?o.mapping=ns:a===ro&&(o.mapping=is),o}function n(o){if(o&&o.isTexture){const a=o.mapping;if(a===so||a===ro)if(t.has(o)){const l=t.get(o).texture;return e(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new Ff(l.height);return c.fromEquirectangularTexture(i,o),t.set(o,c),o.addEventListener("dispose",s),e(c.texture,o.mapping)}else return null}}return o}function s(o){const a=o.target;a.removeEventListener("dispose",s);const l=t.get(a);l!==void 0&&(t.delete(a),l.dispose())}function r(){t=new WeakMap}return{get:n,dispose:r}}class Xr extends Tu{constructor(t=-1,e=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-t,o=n+t,a=s+e,l=s-e;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=u*this.view.offsetY,l=a-u*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}}const Ji=4,ql=[.125,.215,.35,.446,.526,.582],ci=20,Ca=new Xr,Yl=new St;let Ra=null,Pa=0,La=0,Da=!1;const oi=(1+Math.sqrt(5))/2,zi=1/oi,jl=[new C(-oi,zi,0),new C(oi,zi,0),new C(-zi,0,oi),new C(zi,0,oi),new C(0,oi,-zi),new C(0,oi,zi),new C(-1,1,-1),new C(1,1,-1),new C(-1,1,1),new C(1,1,1)];class Kl{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,n=.1,s=100){Ra=this._renderer.getRenderTarget(),Pa=this._renderer.getActiveCubeFace(),La=this._renderer.getActiveMipmapLevel(),Da=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(t,n,s,r),e>0&&this._blur(r,0,0,e),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Ql(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Jl(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(Ra,Pa,La),this._renderer.xr.enabled=Da,t.scissorTest=!1,lr(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===ns||t.mapping===is?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),Ra=this._renderer.getRenderTarget(),Pa=this._renderer.getActiveCubeFace(),La=this._renderer.getActiveMipmapLevel(),Da=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:un,minFilter:un,generateMipmaps:!1,type:$n,format:yn,colorSpace:Kn,depthBuffer:!1},s=Zl(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Zl(t,e,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Ag(r)),this._blurMaterial=Cg(r,t,e)}return s}_compileMaterial(t){const e=new xt(this._lodPlanes[0],t);this._renderer.compile(e,Ca)}_sceneToCubeUV(t,e,n,s){const a=new nn(90,1,e,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],u=this._renderer,h=u.autoClear,d=u.toneMapping;u.getClearColor(Yl),u.toneMapping=Xn,u.autoClear=!1;const p=new ke({name:"PMREM.Background",side:Ue,depthWrite:!1,depthTest:!1}),g=new xt(new le,p);let _=!1;const m=t.background;m?m.isColor&&(p.color.copy(m),t.background=null,_=!0):(p.color.copy(Yl),_=!0);for(let f=0;f<6;f++){const S=f%3;S===0?(a.up.set(0,l[f],0),a.lookAt(c[f],0,0)):S===1?(a.up.set(0,0,l[f]),a.lookAt(0,c[f],0)):(a.up.set(0,l[f],0),a.lookAt(0,0,c[f]));const x=this._cubeSize;lr(s,S*x,f>2?x:0,x,x),u.setRenderTarget(s),_&&u.render(g,a),u.render(t,a)}g.geometry.dispose(),g.material.dispose(),u.toneMapping=d,u.autoClear=h,t.background=m}_textureToCubeUV(t,e){const n=this._renderer,s=t.mapping===ns||t.mapping===is;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Ql()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Jl());const r=s?this._cubemapMaterial:this._equirectMaterial,o=new xt(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=t;const l=this._cubeSize;lr(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(o,Ca)}_applyPMREM(t){const e=this._renderer,n=e.autoClear;e.autoClear=!1;const s=this._lodPlanes.length;for(let r=1;r<s;r++){const o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=jl[(s-r-1)%jl.length];this._blur(t,r-1,r,o,a)}e.autoClear=n}_blur(t,e,n,s,r){const o=this._pingPongRenderTarget;this._halfBlur(t,o,e,n,s,"latitudinal",r),this._halfBlur(o,t,n,n,s,"longitudinal",r)}_halfBlur(t,e,n,s,r,o,a){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const u=3,h=new xt(this._lodPlanes[s],c),d=c.uniforms,p=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*p):2*Math.PI/(2*ci-1),_=r/g,m=isFinite(r)?1+Math.floor(u*_):ci;m>ci&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${ci}`);const f=[];let S=0;for(let A=0;A<ci;++A){const I=A/_,E=Math.exp(-I*I/2);f.push(E),A===0?S+=E:A<m&&(S+=2*E)}for(let A=0;A<f.length;A++)f[A]=f[A]/S;d.envMap.value=t.texture,d.samples.value=m,d.weights.value=f,d.latitudinal.value=o==="latitudinal",a&&(d.poleAxis.value=a);const{_lodMax:x}=this;d.dTheta.value=g,d.mipInt.value=x-n;const T=this._sizeLods[s],P=3*T*(s>x-Ji?s-x+Ji:0),w=4*(this._cubeSize-T);lr(e,P,w,3*T,2*T),l.setRenderTarget(e),l.render(h,Ca)}}function Ag(i){const t=[],e=[],n=[];let s=i;const r=i-Ji+1+ql.length;for(let o=0;o<r;o++){const a=Math.pow(2,s);e.push(a);let l=1/a;o>i-Ji?l=ql[o-i+Ji-1]:o===0&&(l=0),n.push(l);const c=1/(a-2),u=-c,h=1+c,d=[u,u,h,u,h,h,u,u,h,h,u,h],p=6,g=6,_=3,m=2,f=1,S=new Float32Array(_*g*p),x=new Float32Array(m*g*p),T=new Float32Array(f*g*p);for(let w=0;w<p;w++){const A=w%3*2/3-1,I=w>2?0:-1,E=[A,I,0,A+2/3,I,0,A+2/3,I+1,0,A,I,0,A+2/3,I+1,0,A,I+1,0];S.set(E,_*g*w),x.set(d,m*g*w);const y=[w,w,w,w,w,w];T.set(y,f*g*w)}const P=new qt;P.setAttribute("position",new Pe(S,_)),P.setAttribute("uv",new Pe(x,m)),P.setAttribute("faceIndex",new Pe(T,f)),t.push(P),s>Ji&&s--}return{lodPlanes:t,sizeLods:e,sigmas:n}}function Zl(i,t,e){const n=new dn(i,t,e);return n.texture.mapping=Vr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function lr(i,t,e,n,s){i.viewport.set(t,e,n,s),i.scissor.set(t,e,n,s)}function Cg(i,t,e){const n=new Float32Array(ci),s=new C(0,1,0);return new Le({name:"SphericalGaussianBlur",defines:{n:ci,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Co(),fragmentShader:`

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
		`,blending:Dn,depthTest:!1,depthWrite:!1})}function Jl(){return new Le({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Co(),fragmentShader:`

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
		`,blending:Dn,depthTest:!1,depthWrite:!1})}function Ql(){return new Le({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Co(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Dn,depthTest:!1,depthWrite:!1})}function Co(){return`

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
	`}function Rg(i){let t=new WeakMap,e=null;function n(a){if(a&&a.isTexture){const l=a.mapping,c=l===so||l===ro,u=l===ns||l===is;if(c||u){let h=t.get(a);const d=h!==void 0?h.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==d)return e===null&&(e=new Kl(i)),h=c?e.fromEquirectangular(a,h):e.fromCubemap(a,h),h.texture.pmremVersion=a.pmremVersion,t.set(a,h),h.texture;if(h!==void 0)return h.texture;{const p=a.image;return c&&p&&p.height>0||u&&p&&s(p)?(e===null&&(e=new Kl(i)),h=c?e.fromEquirectangular(a):e.fromCubemap(a),h.texture.pmremVersion=a.pmremVersion,t.set(a,h),a.addEventListener("dispose",r),h.texture):null}}}return a}function s(a){let l=0;const c=6;for(let u=0;u<c;u++)a[u]!==void 0&&l++;return l===c}function r(a){const l=a.target;l.removeEventListener("dispose",r);const c=t.get(l);c!==void 0&&(t.delete(l),c.dispose())}function o(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:n,dispose:o}}function Pg(i){const t={};function e(n){if(t[n]!==void 0)return t[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){const s=e(n);return s===null&&To("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function Lg(i,t,e,n){const s={},r=new WeakMap;function o(h){const d=h.target;d.index!==null&&t.remove(d.index);for(const g in d.attributes)t.remove(d.attributes[g]);for(const g in d.morphAttributes){const _=d.morphAttributes[g];for(let m=0,f=_.length;m<f;m++)t.remove(_[m])}d.removeEventListener("dispose",o),delete s[d.id];const p=r.get(d);p&&(t.remove(p),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,e.memory.geometries--}function a(h,d){return s[d.id]===!0||(d.addEventListener("dispose",o),s[d.id]=!0,e.memory.geometries++),d}function l(h){const d=h.attributes;for(const g in d)t.update(d[g],i.ARRAY_BUFFER);const p=h.morphAttributes;for(const g in p){const _=p[g];for(let m=0,f=_.length;m<f;m++)t.update(_[m],i.ARRAY_BUFFER)}}function c(h){const d=[],p=h.index,g=h.attributes.position;let _=0;if(p!==null){const S=p.array;_=p.version;for(let x=0,T=S.length;x<T;x+=3){const P=S[x+0],w=S[x+1],A=S[x+2];d.push(P,w,w,A,A,P)}}else if(g!==void 0){const S=g.array;_=g.version;for(let x=0,T=S.length/3-1;x<T;x+=3){const P=x+0,w=x+1,A=x+2;d.push(P,w,w,A,A,P)}}else return;const m=new(_u(d)?bu:Su)(d,1);m.version=_;const f=r.get(h);f&&t.remove(f),r.set(h,m)}function u(h){const d=r.get(h);if(d){const p=h.index;p!==null&&d.version<p.version&&c(h)}else c(h);return r.get(h)}return{get:a,update:l,getWireframeAttribute:u}}function Dg(i,t,e){let n;function s(d){n=d}let r,o;function a(d){r=d.type,o=d.bytesPerElement}function l(d,p){i.drawElements(n,p,r,d*o),e.update(p,n,1)}function c(d,p,g){g!==0&&(i.drawElementsInstanced(n,p,r,d*o,g),e.update(p,n,g))}function u(d,p,g){if(g===0)return;const _=t.get("WEBGL_multi_draw");if(_===null)for(let m=0;m<g;m++)this.render(d[m]/o,p[m]);else{_.multiDrawElementsWEBGL(n,p,0,r,d,0,g);let m=0;for(let f=0;f<g;f++)m+=p[f];e.update(m,n,1)}}function h(d,p,g,_){if(g===0)return;const m=t.get("WEBGL_multi_draw");if(m===null)for(let f=0;f<d.length;f++)c(d[f]/o,p[f],_[f]);else{m.multiDrawElementsInstancedWEBGL(n,p,0,r,d,0,_,0,g);let f=0;for(let S=0;S<g;S++)f+=p[S];for(let S=0;S<_.length;S++)e.update(f,n,_[S])}}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=u,this.renderMultiDrawInstances=h}function Ig(i){const t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(e.calls++,o){case i.TRIANGLES:e.triangles+=a*(r/3);break;case i.LINES:e.lines+=a*(r/2);break;case i.LINE_STRIP:e.lines+=a*(r-1);break;case i.LINE_LOOP:e.lines+=a*r;break;case i.POINTS:e.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function Ug(i,t,e){const n=new WeakMap,s=new ue;function r(o,a,l){const c=o.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,h=u!==void 0?u.length:0;let d=n.get(a);if(d===void 0||d.count!==h){let y=function(){I.dispose(),n.delete(a),a.removeEventListener("dispose",y)};var p=y;d!==void 0&&d.texture.dispose();const g=a.morphAttributes.position!==void 0,_=a.morphAttributes.normal!==void 0,m=a.morphAttributes.color!==void 0,f=a.morphAttributes.position||[],S=a.morphAttributes.normal||[],x=a.morphAttributes.color||[];let T=0;g===!0&&(T=1),_===!0&&(T=2),m===!0&&(T=3);let P=a.attributes.position.count*T,w=1;P>t.maxTextureSize&&(w=Math.ceil(P/t.maxTextureSize),P=t.maxTextureSize);const A=new Float32Array(P*w*4*h),I=new yu(A,P,w,h);I.type=Pn,I.needsUpdate=!0;const E=T*4;for(let L=0;L<h;L++){const B=f[L],z=S[L],$=x[L],Y=P*w*4*L;for(let W=0;W<B.count;W++){const j=W*E;g===!0&&(s.fromBufferAttribute(B,W),A[Y+j+0]=s.x,A[Y+j+1]=s.y,A[Y+j+2]=s.z,A[Y+j+3]=0),_===!0&&(s.fromBufferAttribute(z,W),A[Y+j+4]=s.x,A[Y+j+5]=s.y,A[Y+j+6]=s.z,A[Y+j+7]=0),m===!0&&(s.fromBufferAttribute($,W),A[Y+j+8]=s.x,A[Y+j+9]=s.y,A[Y+j+10]=s.z,A[Y+j+11]=$.itemSize===4?s.w:1)}}d={count:h,texture:I,size:new tt(P,w)},n.set(a,d),a.addEventListener("dispose",y)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",o.morphTexture,e);else{let g=0;for(let m=0;m<c.length;m++)g+=c[m];const _=a.morphTargetsRelative?1:1-g;l.getUniforms().setValue(i,"morphTargetBaseInfluence",_),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",d.texture,e),l.getUniforms().setValue(i,"morphTargetsTextureSize",d.size)}return{update:r}}function Ng(i,t,e,n){let s=new WeakMap;function r(l){const c=n.render.frame,u=l.geometry,h=t.get(l,u);if(s.get(h)!==c&&(t.update(h),s.set(h,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),s.get(l)!==c&&(e.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){const d=l.skeleton;s.get(d)!==c&&(d.update(),s.set(d,c))}return h}function o(){s=new WeakMap}function a(l){const c=l.target;c.removeEventListener("dispose",a),e.remove(c.instanceMatrix),c.instanceColor!==null&&e.remove(c.instanceColor)}return{update:r,dispose:o}}class Cu extends Ne{constructor(t,e,n,s,r,o,a,l,c,u=ts){if(u!==ts&&u!==as)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&u===ts&&(n=ss),n===void 0&&u===as&&(n=rs),super(null,s,r,o,a,l,u,n,c),this.isDepthTexture=!0,this.image={width:t,height:e},this.magFilter=a!==void 0?a:He,this.minFilter=l!==void 0?l:He,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.compareFunction=t.compareFunction,this}toJSON(t){const e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}}const Ru=new Ne,Pu=new Cu(1,1);Pu.compareFunction=vu;const Lu=new yu,Du=new Sf,Iu=new wu,tc=[],ec=[],nc=new Float32Array(16),ic=new Float32Array(9),sc=new Float32Array(4);function cs(i,t,e){const n=i[0];if(n<=0||n>0)return i;const s=t*e;let r=tc[s];if(r===void 0&&(r=new Float32Array(s),tc[s]=r),t!==0){n.toArray(r,0);for(let o=1,a=0;o!==t;++o)a+=e,i[o].toArray(r,a)}return r}function Se(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function be(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function $r(i,t){let e=ec[t];e===void 0&&(e=new Int32Array(t),ec[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function Og(i,t){const e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function Fg(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Se(e,t))return;i.uniform2fv(this.addr,t),be(e,t)}}function Bg(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Se(e,t))return;i.uniform3fv(this.addr,t),be(e,t)}}function zg(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Se(e,t))return;i.uniform4fv(this.addr,t),be(e,t)}}function kg(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Se(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),be(e,t)}else{if(Se(e,n))return;sc.set(n),i.uniformMatrix2fv(this.addr,!1,sc),be(e,n)}}function Hg(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Se(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),be(e,t)}else{if(Se(e,n))return;ic.set(n),i.uniformMatrix3fv(this.addr,!1,ic),be(e,n)}}function Gg(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Se(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),be(e,t)}else{if(Se(e,n))return;nc.set(n),i.uniformMatrix4fv(this.addr,!1,nc),be(e,n)}}function Vg(i,t){const e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function Wg(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Se(e,t))return;i.uniform2iv(this.addr,t),be(e,t)}}function Xg(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Se(e,t))return;i.uniform3iv(this.addr,t),be(e,t)}}function $g(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Se(e,t))return;i.uniform4iv(this.addr,t),be(e,t)}}function qg(i,t){const e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function Yg(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Se(e,t))return;i.uniform2uiv(this.addr,t),be(e,t)}}function jg(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Se(e,t))return;i.uniform3uiv(this.addr,t),be(e,t)}}function Kg(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Se(e,t))return;i.uniform4uiv(this.addr,t),be(e,t)}}function Zg(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);const r=this.type===i.SAMPLER_2D_SHADOW?Pu:Ru;e.setTexture2D(t||r,s)}function Jg(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||Du,s)}function Qg(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTextureCube(t||Iu,s)}function t0(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||Lu,s)}function e0(i){switch(i){case 5126:return Og;case 35664:return Fg;case 35665:return Bg;case 35666:return zg;case 35674:return kg;case 35675:return Hg;case 35676:return Gg;case 5124:case 35670:return Vg;case 35667:case 35671:return Wg;case 35668:case 35672:return Xg;case 35669:case 35673:return $g;case 5125:return qg;case 36294:return Yg;case 36295:return jg;case 36296:return Kg;case 35678:case 36198:case 36298:case 36306:case 35682:return Zg;case 35679:case 36299:case 36307:return Jg;case 35680:case 36300:case 36308:case 36293:return Qg;case 36289:case 36303:case 36311:case 36292:return t0}}function n0(i,t){i.uniform1fv(this.addr,t)}function i0(i,t){const e=cs(t,this.size,2);i.uniform2fv(this.addr,e)}function s0(i,t){const e=cs(t,this.size,3);i.uniform3fv(this.addr,e)}function r0(i,t){const e=cs(t,this.size,4);i.uniform4fv(this.addr,e)}function a0(i,t){const e=cs(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function o0(i,t){const e=cs(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function l0(i,t){const e=cs(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function c0(i,t){i.uniform1iv(this.addr,t)}function u0(i,t){i.uniform2iv(this.addr,t)}function h0(i,t){i.uniform3iv(this.addr,t)}function d0(i,t){i.uniform4iv(this.addr,t)}function f0(i,t){i.uniform1uiv(this.addr,t)}function p0(i,t){i.uniform2uiv(this.addr,t)}function m0(i,t){i.uniform3uiv(this.addr,t)}function g0(i,t){i.uniform4uiv(this.addr,t)}function v0(i,t,e){const n=this.cache,s=t.length,r=$r(e,s);Se(n,r)||(i.uniform1iv(this.addr,r),be(n,r));for(let o=0;o!==s;++o)e.setTexture2D(t[o]||Ru,r[o])}function _0(i,t,e){const n=this.cache,s=t.length,r=$r(e,s);Se(n,r)||(i.uniform1iv(this.addr,r),be(n,r));for(let o=0;o!==s;++o)e.setTexture3D(t[o]||Du,r[o])}function x0(i,t,e){const n=this.cache,s=t.length,r=$r(e,s);Se(n,r)||(i.uniform1iv(this.addr,r),be(n,r));for(let o=0;o!==s;++o)e.setTextureCube(t[o]||Iu,r[o])}function y0(i,t,e){const n=this.cache,s=t.length,r=$r(e,s);Se(n,r)||(i.uniform1iv(this.addr,r),be(n,r));for(let o=0;o!==s;++o)e.setTexture2DArray(t[o]||Lu,r[o])}function M0(i){switch(i){case 5126:return n0;case 35664:return i0;case 35665:return s0;case 35666:return r0;case 35674:return a0;case 35675:return o0;case 35676:return l0;case 5124:case 35670:return c0;case 35667:case 35671:return u0;case 35668:case 35672:return h0;case 35669:case 35673:return d0;case 5125:return f0;case 36294:return p0;case 36295:return m0;case 36296:return g0;case 35678:case 36198:case 36298:case 36306:case 35682:return v0;case 35679:case 36299:case 36307:return _0;case 35680:case 36300:case 36308:case 36293:return x0;case 36289:case 36303:case 36311:case 36292:return y0}}class S0{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=e0(e.type)}}class b0{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=M0(e.type)}}class E0{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){const s=this.seq;for(let r=0,o=s.length;r!==o;++r){const a=s[r];a.setValue(t,e[a.id],n)}}}const Ia=/(\w+)(\])?(\[|\.)?/g;function rc(i,t){i.seq.push(t),i.map[t.id]=t}function T0(i,t,e){const n=i.name,s=n.length;for(Ia.lastIndex=0;;){const r=Ia.exec(n),o=Ia.lastIndex;let a=r[1];const l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){rc(e,c===void 0?new S0(a,i,t):new b0(a,i,t));break}else{let h=e.map[a];h===void 0&&(h=new E0(a),rc(e,h)),e=h}}}class Tr{constructor(t,e){this.seq=[],this.map={};const n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){const r=t.getActiveUniform(e,s),o=t.getUniformLocation(e,r.name);T0(r,o,this)}}setValue(t,e,n,s){const r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){const s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,o=e.length;r!==o;++r){const a=e[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(t,l.value,s)}}static seqWithValue(t,e){const n=[];for(let s=0,r=t.length;s!==r;++s){const o=t[s];o.id in e&&n.push(o)}return n}}function ac(i,t,e){const n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}const w0=37297;let A0=0;function C0(i,t){const e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let o=s;o<r;o++){const a=o+1;n.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return n.join(`
`)}function R0(i){const t=te.getPrimaries(te.workingColorSpace),e=te.getPrimaries(i);let n;switch(t===e?n="":t===Dr&&e===Lr?n="LinearDisplayP3ToLinearSRGB":t===Lr&&e===Dr&&(n="LinearSRGBToLinearDisplayP3"),i){case Kn:case Wr:return[n,"LinearTransferOETF"];case tn:case Eo:return[n,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",i),[n,"LinearTransferOETF"]}}function oc(i,t,e){const n=i.getShaderParameter(t,i.COMPILE_STATUS),s=i.getShaderInfoLog(t).trim();if(n&&s==="")return"";const r=/ERROR: 0:(\d+)/.exec(s);if(r){const o=parseInt(r[1]);return e.toUpperCase()+`

`+s+`

`+C0(i.getShaderSource(t),o)}else return s}function P0(i,t){const e=R0(t);return`vec4 ${i}( vec4 value ) { return ${e[0]}( ${e[1]}( value ) ); }`}function L0(i,t){let e;switch(t){case iu:e="Linear";break;case su:e="Reinhard";break;case ru:e="OptimizedCineon";break;case bo:e="ACESFilmic";break;case au:e="AgX";break;case ou:e="Neutral";break;case Xd:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}function D0(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Ss).join(`
`)}function I0(i){const t=[];for(const e in i){const n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function U0(i,t){const e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(t,s),o=r.name;let a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),e[o]={type:r.type,location:i.getAttribLocation(t,o),locationSize:a}}return e}function Ss(i){return i!==""}function lc(i,t){const e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function cc(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const N0=/^[ \t]*#include +<([\w\d./]+)>/gm;function co(i){return i.replace(N0,F0)}const O0=new Map;function F0(i,t){let e=Nt[t];if(e===void 0){const n=O0.get(t);if(n!==void 0)e=Nt[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("Can not resolve #include <"+t+">")}return co(e)}const B0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function uc(i){return i.replace(B0,z0)}function z0(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function hc(i){let t=`precision ${i.precision} float;
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
	`;return i.precision==="highp"?t+=`
#define HIGH_PRECISION`:i.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function k0(i){let t="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===tu?t="SHADOWMAP_TYPE_PCF":i.shadowMapType===eu?t="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===Rn&&(t="SHADOWMAP_TYPE_VSM"),t}function H0(i){let t="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case ns:case is:t="ENVMAP_TYPE_CUBE";break;case Vr:t="ENVMAP_TYPE_CUBE_UV";break}return t}function G0(i){let t="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case is:t="ENVMAP_MODE_REFRACTION";break}return t}function V0(i){let t="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case nu:t="ENVMAP_BLENDING_MULTIPLY";break;case Vd:t="ENVMAP_BLENDING_MIX";break;case Wd:t="ENVMAP_BLENDING_ADD";break}return t}function W0(i){const t=i.envMapCubeUVHeight;if(t===null)return null;const e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),7*16)),texelHeight:n,maxMip:e}}function X0(i,t,e,n){const s=i.getContext(),r=e.defines;let o=e.vertexShader,a=e.fragmentShader;const l=k0(e),c=H0(e),u=G0(e),h=V0(e),d=W0(e),p=D0(e),g=I0(r),_=s.createProgram();let m,f,S=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(Ss).join(`
`),m.length>0&&(m+=`
`),f=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(Ss).join(`
`),f.length>0&&(f+=`
`)):(m=[hc(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+u:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Ss).join(`
`),f=[hc(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+u:"",e.envMap?"#define "+h:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor||e.batchingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Xn?"#define TONE_MAPPING":"",e.toneMapping!==Xn?Nt.tonemapping_pars_fragment:"",e.toneMapping!==Xn?L0("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",Nt.colorspace_pars_fragment,P0("linearToOutputTexel",e.outputColorSpace),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Ss).join(`
`)),o=co(o),o=lc(o,e),o=cc(o,e),a=co(a),a=lc(a,e),a=cc(a,e),o=uc(o),a=uc(a),e.isRawShaderMaterial!==!0&&(S=`#version 300 es
`,m=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,f=["#define varying in",e.glslVersion===Al?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Al?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+f);const x=S+m+o,T=S+f+a,P=ac(s,s.VERTEX_SHADER,x),w=ac(s,s.FRAGMENT_SHADER,T);s.attachShader(_,P),s.attachShader(_,w),e.index0AttributeName!==void 0?s.bindAttribLocation(_,0,e.index0AttributeName):e.morphTargets===!0&&s.bindAttribLocation(_,0,"position"),s.linkProgram(_);function A(L){if(i.debug.checkShaderErrors){const B=s.getProgramInfoLog(_).trim(),z=s.getShaderInfoLog(P).trim(),$=s.getShaderInfoLog(w).trim();let Y=!0,W=!0;if(s.getProgramParameter(_,s.LINK_STATUS)===!1)if(Y=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,_,P,w);else{const j=oc(s,P,"vertex"),X=oc(s,w,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(_,s.VALIDATE_STATUS)+`

Material Name: `+L.name+`
Material Type: `+L.type+`

Program Info Log: `+B+`
`+j+`
`+X)}else B!==""?console.warn("THREE.WebGLProgram: Program Info Log:",B):(z===""||$==="")&&(W=!1);W&&(L.diagnostics={runnable:Y,programLog:B,vertexShader:{log:z,prefix:m},fragmentShader:{log:$,prefix:f}})}s.deleteShader(P),s.deleteShader(w),I=new Tr(s,_),E=U0(s,_)}let I;this.getUniforms=function(){return I===void 0&&A(this),I};let E;this.getAttributes=function(){return E===void 0&&A(this),E};let y=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return y===!1&&(y=s.getProgramParameter(_,w0)),y},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(_),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=A0++,this.cacheKey=t,this.usedTimes=1,this.program=_,this.vertexShader=P,this.fragmentShader=w,this}let $0=0;class q0{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){const e=t.vertexShader,n=t.fragmentShader,s=this._getShaderStage(e),r=this._getShaderStage(n),o=this._getShaderCacheForMaterial(t);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(t){const e=this.materialCache.get(t);for(const n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const e=this.materialCache;let n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){const e=this.shaderCache;let n=e.get(t);return n===void 0&&(n=new Y0(t),e.set(t,n)),n}}class Y0{constructor(t){this.id=$0++,this.code=t,this.usedTimes=0}}function j0(i,t,e,n,s,r,o){const a=new wo,l=new q0,c=new Set,u=[],h=s.logarithmicDepthBuffer,d=s.vertexTextures;let p=s.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(E){return c.add(E),E===0?"uv":`uv${E}`}function m(E,y,L,B,z){const $=B.fog,Y=z.geometry,W=E.isMeshStandardMaterial?B.environment:null,j=(E.isMeshStandardMaterial?e:t).get(E.envMap||W),X=j&&j.mapping===Vr?j.image.height:null,ht=g[E.type];E.precision!==null&&(p=s.getMaxPrecision(E.precision),p!==E.precision&&console.warn("THREE.WebGLProgram.getParameters:",E.precision,"not supported, using",p,"instead."));const dt=Y.morphAttributes.position||Y.morphAttributes.normal||Y.morphAttributes.color,gt=dt!==void 0?dt.length:0;let Gt=0;Y.morphAttributes.position!==void 0&&(Gt=1),Y.morphAttributes.normal!==void 0&&(Gt=2),Y.morphAttributes.color!==void 0&&(Gt=3);let Yt,q,et,ft;if(ht){const jt=_n[ht];Yt=jt.vertexShader,q=jt.fragmentShader}else Yt=E.vertexShader,q=E.fragmentShader,l.update(E),et=l.getVertexShaderID(E),ft=l.getFragmentShaderID(E);const ot=i.getRenderTarget(),Ft=z.isInstancedMesh===!0,Pt=z.isBatchedMesh===!0,Vt=!!E.map,D=!!E.matcap,Wt=!!j,Ht=!!E.aoMap,ae=!!E.lightMap,Et=!!E.bumpMap,Xt=!!E.normalMap,Bt=!!E.displacementMap,Lt=!!E.emissiveMap,he=!!E.metalnessMap,R=!!E.roughnessMap,M=E.anisotropy>0,H=E.clearcoat>0,K=E.dispersion>0,J=E.iridescence>0,Q=E.sheen>0,yt=E.transmission>0,rt=M&&!!E.anisotropyMap,st=H&&!!E.clearcoatMap,Dt=H&&!!E.clearcoatNormalMap,nt=H&&!!E.clearcoatRoughnessMap,vt=J&&!!E.iridescenceMap,kt=J&&!!E.iridescenceThicknessMap,wt=Q&&!!E.sheenColorMap,lt=Q&&!!E.sheenRoughnessMap,It=!!E.specularMap,Ut=!!E.specularColorMap,fe=!!E.specularIntensityMap,v=yt&&!!E.transmissionMap,G=yt&&!!E.thicknessMap,O=!!E.gradientMap,V=!!E.alphaMap,Z=E.alphaTest>0,Mt=!!E.alphaHash,Rt=!!E.extensions;let pe=Xn;E.toneMapped&&(ot===null||ot.isXRRenderTarget===!0)&&(pe=i.toneMapping);const _e={shaderID:ht,shaderType:E.type,shaderName:E.name,vertexShader:Yt,fragmentShader:q,defines:E.defines,customVertexShaderID:et,customFragmentShaderID:ft,isRawShaderMaterial:E.isRawShaderMaterial===!0,glslVersion:E.glslVersion,precision:p,batching:Pt,batchingColor:Pt&&z._colorsTexture!==null,instancing:Ft,instancingColor:Ft&&z.instanceColor!==null,instancingMorph:Ft&&z.morphTexture!==null,supportsVertexTextures:d,outputColorSpace:ot===null?i.outputColorSpace:ot.isXRRenderTarget===!0?ot.texture.colorSpace:Kn,alphaToCoverage:!!E.alphaToCoverage,map:Vt,matcap:D,envMap:Wt,envMapMode:Wt&&j.mapping,envMapCubeUVHeight:X,aoMap:Ht,lightMap:ae,bumpMap:Et,normalMap:Xt,displacementMap:d&&Bt,emissiveMap:Lt,normalMapObjectSpace:Xt&&E.normalMapType===rf,normalMapTangentSpace:Xt&&E.normalMapType===gu,metalnessMap:he,roughnessMap:R,anisotropy:M,anisotropyMap:rt,clearcoat:H,clearcoatMap:st,clearcoatNormalMap:Dt,clearcoatRoughnessMap:nt,dispersion:K,iridescence:J,iridescenceMap:vt,iridescenceThicknessMap:kt,sheen:Q,sheenColorMap:wt,sheenRoughnessMap:lt,specularMap:It,specularColorMap:Ut,specularIntensityMap:fe,transmission:yt,transmissionMap:v,thicknessMap:G,gradientMap:O,opaque:E.transparent===!1&&E.blending===Qi&&E.alphaToCoverage===!1,alphaMap:V,alphaTest:Z,alphaHash:Mt,combine:E.combine,mapUv:Vt&&_(E.map.channel),aoMapUv:Ht&&_(E.aoMap.channel),lightMapUv:ae&&_(E.lightMap.channel),bumpMapUv:Et&&_(E.bumpMap.channel),normalMapUv:Xt&&_(E.normalMap.channel),displacementMapUv:Bt&&_(E.displacementMap.channel),emissiveMapUv:Lt&&_(E.emissiveMap.channel),metalnessMapUv:he&&_(E.metalnessMap.channel),roughnessMapUv:R&&_(E.roughnessMap.channel),anisotropyMapUv:rt&&_(E.anisotropyMap.channel),clearcoatMapUv:st&&_(E.clearcoatMap.channel),clearcoatNormalMapUv:Dt&&_(E.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:nt&&_(E.clearcoatRoughnessMap.channel),iridescenceMapUv:vt&&_(E.iridescenceMap.channel),iridescenceThicknessMapUv:kt&&_(E.iridescenceThicknessMap.channel),sheenColorMapUv:wt&&_(E.sheenColorMap.channel),sheenRoughnessMapUv:lt&&_(E.sheenRoughnessMap.channel),specularMapUv:It&&_(E.specularMap.channel),specularColorMapUv:Ut&&_(E.specularColorMap.channel),specularIntensityMapUv:fe&&_(E.specularIntensityMap.channel),transmissionMapUv:v&&_(E.transmissionMap.channel),thicknessMapUv:G&&_(E.thicknessMap.channel),alphaMapUv:V&&_(E.alphaMap.channel),vertexTangents:!!Y.attributes.tangent&&(Xt||M),vertexColors:E.vertexColors,vertexAlphas:E.vertexColors===!0&&!!Y.attributes.color&&Y.attributes.color.itemSize===4,pointsUvs:z.isPoints===!0&&!!Y.attributes.uv&&(Vt||V),fog:!!$,useFog:E.fog===!0,fogExp2:!!$&&$.isFogExp2,flatShading:E.flatShading===!0,sizeAttenuation:E.sizeAttenuation===!0,logarithmicDepthBuffer:h,skinning:z.isSkinnedMesh===!0,morphTargets:Y.morphAttributes.position!==void 0,morphNormals:Y.morphAttributes.normal!==void 0,morphColors:Y.morphAttributes.color!==void 0,morphTargetsCount:gt,morphTextureStride:Gt,numDirLights:y.directional.length,numPointLights:y.point.length,numSpotLights:y.spot.length,numSpotLightMaps:y.spotLightMap.length,numRectAreaLights:y.rectArea.length,numHemiLights:y.hemi.length,numDirLightShadows:y.directionalShadowMap.length,numPointLightShadows:y.pointShadowMap.length,numSpotLightShadows:y.spotShadowMap.length,numSpotLightShadowsWithMaps:y.numSpotLightShadowsWithMaps,numLightProbes:y.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:E.dithering,shadowMapEnabled:i.shadowMap.enabled&&L.length>0,shadowMapType:i.shadowMap.type,toneMapping:pe,decodeVideoTexture:Vt&&E.map.isVideoTexture===!0&&te.getTransfer(E.map.colorSpace)===oe,premultipliedAlpha:E.premultipliedAlpha,doubleSided:E.side===je,flipSided:E.side===Ue,useDepthPacking:E.depthPacking>=0,depthPacking:E.depthPacking||0,index0AttributeName:E.index0AttributeName,extensionClipCullDistance:Rt&&E.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:Rt&&E.extensions.multiDraw===!0&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:E.customProgramCacheKey()};return _e.vertexUv1s=c.has(1),_e.vertexUv2s=c.has(2),_e.vertexUv3s=c.has(3),c.clear(),_e}function f(E){const y=[];if(E.shaderID?y.push(E.shaderID):(y.push(E.customVertexShaderID),y.push(E.customFragmentShaderID)),E.defines!==void 0)for(const L in E.defines)y.push(L),y.push(E.defines[L]);return E.isRawShaderMaterial===!1&&(S(y,E),x(y,E),y.push(i.outputColorSpace)),y.push(E.customProgramCacheKey),y.join()}function S(E,y){E.push(y.precision),E.push(y.outputColorSpace),E.push(y.envMapMode),E.push(y.envMapCubeUVHeight),E.push(y.mapUv),E.push(y.alphaMapUv),E.push(y.lightMapUv),E.push(y.aoMapUv),E.push(y.bumpMapUv),E.push(y.normalMapUv),E.push(y.displacementMapUv),E.push(y.emissiveMapUv),E.push(y.metalnessMapUv),E.push(y.roughnessMapUv),E.push(y.anisotropyMapUv),E.push(y.clearcoatMapUv),E.push(y.clearcoatNormalMapUv),E.push(y.clearcoatRoughnessMapUv),E.push(y.iridescenceMapUv),E.push(y.iridescenceThicknessMapUv),E.push(y.sheenColorMapUv),E.push(y.sheenRoughnessMapUv),E.push(y.specularMapUv),E.push(y.specularColorMapUv),E.push(y.specularIntensityMapUv),E.push(y.transmissionMapUv),E.push(y.thicknessMapUv),E.push(y.combine),E.push(y.fogExp2),E.push(y.sizeAttenuation),E.push(y.morphTargetsCount),E.push(y.morphAttributeCount),E.push(y.numDirLights),E.push(y.numPointLights),E.push(y.numSpotLights),E.push(y.numSpotLightMaps),E.push(y.numHemiLights),E.push(y.numRectAreaLights),E.push(y.numDirLightShadows),E.push(y.numPointLightShadows),E.push(y.numSpotLightShadows),E.push(y.numSpotLightShadowsWithMaps),E.push(y.numLightProbes),E.push(y.shadowMapType),E.push(y.toneMapping),E.push(y.numClippingPlanes),E.push(y.numClipIntersection),E.push(y.depthPacking)}function x(E,y){a.disableAll(),y.supportsVertexTextures&&a.enable(0),y.instancing&&a.enable(1),y.instancingColor&&a.enable(2),y.instancingMorph&&a.enable(3),y.matcap&&a.enable(4),y.envMap&&a.enable(5),y.normalMapObjectSpace&&a.enable(6),y.normalMapTangentSpace&&a.enable(7),y.clearcoat&&a.enable(8),y.iridescence&&a.enable(9),y.alphaTest&&a.enable(10),y.vertexColors&&a.enable(11),y.vertexAlphas&&a.enable(12),y.vertexUv1s&&a.enable(13),y.vertexUv2s&&a.enable(14),y.vertexUv3s&&a.enable(15),y.vertexTangents&&a.enable(16),y.anisotropy&&a.enable(17),y.alphaHash&&a.enable(18),y.batching&&a.enable(19),y.dispersion&&a.enable(20),y.batchingColor&&a.enable(21),E.push(a.mask),a.disableAll(),y.fog&&a.enable(0),y.useFog&&a.enable(1),y.flatShading&&a.enable(2),y.logarithmicDepthBuffer&&a.enable(3),y.skinning&&a.enable(4),y.morphTargets&&a.enable(5),y.morphNormals&&a.enable(6),y.morphColors&&a.enable(7),y.premultipliedAlpha&&a.enable(8),y.shadowMapEnabled&&a.enable(9),y.doubleSided&&a.enable(10),y.flipSided&&a.enable(11),y.useDepthPacking&&a.enable(12),y.dithering&&a.enable(13),y.transmission&&a.enable(14),y.sheen&&a.enable(15),y.opaque&&a.enable(16),y.pointsUvs&&a.enable(17),y.decodeVideoTexture&&a.enable(18),y.alphaToCoverage&&a.enable(19),E.push(a.mask)}function T(E){const y=g[E.type];let L;if(y){const B=_n[y];L=Ds.clone(B.uniforms)}else L=E.uniforms;return L}function P(E,y){let L;for(let B=0,z=u.length;B<z;B++){const $=u[B];if($.cacheKey===y){L=$,++L.usedTimes;break}}return L===void 0&&(L=new X0(i,y,E,r),u.push(L)),L}function w(E){if(--E.usedTimes===0){const y=u.indexOf(E);u[y]=u[u.length-1],u.pop(),E.destroy()}}function A(E){l.remove(E)}function I(){l.dispose()}return{getParameters:m,getProgramCacheKey:f,getUniforms:T,acquireProgram:P,releaseProgram:w,releaseShaderCache:A,programs:u,dispose:I}}function K0(){let i=new WeakMap;function t(r){let o=i.get(r);return o===void 0&&(o={},i.set(r,o)),o}function e(r){i.delete(r)}function n(r,o,a){i.get(r)[o]=a}function s(){i=new WeakMap}return{get:t,remove:e,update:n,dispose:s}}function Z0(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.z!==t.z?i.z-t.z:i.id-t.id}function dc(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function fc(){const i=[];let t=0;const e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function o(h,d,p,g,_,m){let f=i[t];return f===void 0?(f={id:h.id,object:h,geometry:d,material:p,groupOrder:g,renderOrder:h.renderOrder,z:_,group:m},i[t]=f):(f.id=h.id,f.object=h,f.geometry=d,f.material=p,f.groupOrder=g,f.renderOrder=h.renderOrder,f.z=_,f.group=m),t++,f}function a(h,d,p,g,_,m){const f=o(h,d,p,g,_,m);p.transmission>0?n.push(f):p.transparent===!0?s.push(f):e.push(f)}function l(h,d,p,g,_,m){const f=o(h,d,p,g,_,m);p.transmission>0?n.unshift(f):p.transparent===!0?s.unshift(f):e.unshift(f)}function c(h,d){e.length>1&&e.sort(h||Z0),n.length>1&&n.sort(d||dc),s.length>1&&s.sort(d||dc)}function u(){for(let h=t,d=i.length;h<d;h++){const p=i[h];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:a,unshift:l,finish:u,sort:c}}function J0(){let i=new WeakMap;function t(n,s){const r=i.get(n);let o;return r===void 0?(o=new fc,i.set(n,[o])):s>=r.length?(o=new fc,r.push(o)):o=r[s],o}function e(){i=new WeakMap}return{get:t,dispose:e}}function Q0(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new C,color:new St};break;case"SpotLight":e={position:new C,direction:new C,color:new St,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new C,color:new St,distance:0,decay:0};break;case"HemisphereLight":e={direction:new C,skyColor:new St,groundColor:new St};break;case"RectAreaLight":e={color:new St,position:new C,halfWidth:new C,halfHeight:new C};break}return i[t.id]=e,e}}}function tv(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new tt};break;case"SpotLight":e={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new tt};break;case"PointLight":e={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new tt,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}let ev=0;function nv(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function iv(i){const t=new Q0,e=tv(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new C);const s=new C,r=new Jt,o=new Jt;function a(c){let u=0,h=0,d=0;for(let E=0;E<9;E++)n.probe[E].set(0,0,0);let p=0,g=0,_=0,m=0,f=0,S=0,x=0,T=0,P=0,w=0,A=0;c.sort(nv);for(let E=0,y=c.length;E<y;E++){const L=c[E],B=L.color,z=L.intensity,$=L.distance,Y=L.shadow&&L.shadow.map?L.shadow.map.texture:null;if(L.isAmbientLight)u+=B.r*z,h+=B.g*z,d+=B.b*z;else if(L.isLightProbe){for(let W=0;W<9;W++)n.probe[W].addScaledVector(L.sh.coefficients[W],z);A++}else if(L.isDirectionalLight){const W=t.get(L);if(W.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){const j=L.shadow,X=e.get(L);X.shadowBias=j.bias,X.shadowNormalBias=j.normalBias,X.shadowRadius=j.radius,X.shadowMapSize=j.mapSize,n.directionalShadow[p]=X,n.directionalShadowMap[p]=Y,n.directionalShadowMatrix[p]=L.shadow.matrix,S++}n.directional[p]=W,p++}else if(L.isSpotLight){const W=t.get(L);W.position.setFromMatrixPosition(L.matrixWorld),W.color.copy(B).multiplyScalar(z),W.distance=$,W.coneCos=Math.cos(L.angle),W.penumbraCos=Math.cos(L.angle*(1-L.penumbra)),W.decay=L.decay,n.spot[_]=W;const j=L.shadow;if(L.map&&(n.spotLightMap[P]=L.map,P++,j.updateMatrices(L),L.castShadow&&w++),n.spotLightMatrix[_]=j.matrix,L.castShadow){const X=e.get(L);X.shadowBias=j.bias,X.shadowNormalBias=j.normalBias,X.shadowRadius=j.radius,X.shadowMapSize=j.mapSize,n.spotShadow[_]=X,n.spotShadowMap[_]=Y,T++}_++}else if(L.isRectAreaLight){const W=t.get(L);W.color.copy(B).multiplyScalar(z),W.halfWidth.set(L.width*.5,0,0),W.halfHeight.set(0,L.height*.5,0),n.rectArea[m]=W,m++}else if(L.isPointLight){const W=t.get(L);if(W.color.copy(L.color).multiplyScalar(L.intensity),W.distance=L.distance,W.decay=L.decay,L.castShadow){const j=L.shadow,X=e.get(L);X.shadowBias=j.bias,X.shadowNormalBias=j.normalBias,X.shadowRadius=j.radius,X.shadowMapSize=j.mapSize,X.shadowCameraNear=j.camera.near,X.shadowCameraFar=j.camera.far,n.pointShadow[g]=X,n.pointShadowMap[g]=Y,n.pointShadowMatrix[g]=L.shadow.matrix,x++}n.point[g]=W,g++}else if(L.isHemisphereLight){const W=t.get(L);W.skyColor.copy(L.color).multiplyScalar(z),W.groundColor.copy(L.groundColor).multiplyScalar(z),n.hemi[f]=W,f++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=at.LTC_FLOAT_1,n.rectAreaLTC2=at.LTC_FLOAT_2):(n.rectAreaLTC1=at.LTC_HALF_1,n.rectAreaLTC2=at.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=h,n.ambient[2]=d;const I=n.hash;(I.directionalLength!==p||I.pointLength!==g||I.spotLength!==_||I.rectAreaLength!==m||I.hemiLength!==f||I.numDirectionalShadows!==S||I.numPointShadows!==x||I.numSpotShadows!==T||I.numSpotMaps!==P||I.numLightProbes!==A)&&(n.directional.length=p,n.spot.length=_,n.rectArea.length=m,n.point.length=g,n.hemi.length=f,n.directionalShadow.length=S,n.directionalShadowMap.length=S,n.pointShadow.length=x,n.pointShadowMap.length=x,n.spotShadow.length=T,n.spotShadowMap.length=T,n.directionalShadowMatrix.length=S,n.pointShadowMatrix.length=x,n.spotLightMatrix.length=T+P-w,n.spotLightMap.length=P,n.numSpotLightShadowsWithMaps=w,n.numLightProbes=A,I.directionalLength=p,I.pointLength=g,I.spotLength=_,I.rectAreaLength=m,I.hemiLength=f,I.numDirectionalShadows=S,I.numPointShadows=x,I.numSpotShadows=T,I.numSpotMaps=P,I.numLightProbes=A,n.version=ev++)}function l(c,u){let h=0,d=0,p=0,g=0,_=0;const m=u.matrixWorldInverse;for(let f=0,S=c.length;f<S;f++){const x=c[f];if(x.isDirectionalLight){const T=n.directional[h];T.direction.setFromMatrixPosition(x.matrixWorld),s.setFromMatrixPosition(x.target.matrixWorld),T.direction.sub(s),T.direction.transformDirection(m),h++}else if(x.isSpotLight){const T=n.spot[p];T.position.setFromMatrixPosition(x.matrixWorld),T.position.applyMatrix4(m),T.direction.setFromMatrixPosition(x.matrixWorld),s.setFromMatrixPosition(x.target.matrixWorld),T.direction.sub(s),T.direction.transformDirection(m),p++}else if(x.isRectAreaLight){const T=n.rectArea[g];T.position.setFromMatrixPosition(x.matrixWorld),T.position.applyMatrix4(m),o.identity(),r.copy(x.matrixWorld),r.premultiply(m),o.extractRotation(r),T.halfWidth.set(x.width*.5,0,0),T.halfHeight.set(0,x.height*.5,0),T.halfWidth.applyMatrix4(o),T.halfHeight.applyMatrix4(o),g++}else if(x.isPointLight){const T=n.point[d];T.position.setFromMatrixPosition(x.matrixWorld),T.position.applyMatrix4(m),d++}else if(x.isHemisphereLight){const T=n.hemi[_];T.direction.setFromMatrixPosition(x.matrixWorld),T.direction.transformDirection(m),_++}}}return{setup:a,setupView:l,state:n}}function pc(i){const t=new iv(i),e=[],n=[];function s(u){c.camera=u,e.length=0,n.length=0}function r(u){e.push(u)}function o(u){n.push(u)}function a(){t.setup(e)}function l(u){t.setupView(e,u)}const c={lightsArray:e,shadowsArray:n,camera:null,lights:t,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:a,setupLightsView:l,pushLight:r,pushShadow:o}}function sv(i){let t=new WeakMap;function e(s,r=0){const o=t.get(s);let a;return o===void 0?(a=new pc(i),t.set(s,[a])):r>=o.length?(a=new pc(i),o.push(a)):a=o[r],a}function n(){t=new WeakMap}return{get:e,dispose:n}}class rv extends Zn{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=nf,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class av extends Zn{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}const ov=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,lv=`uniform sampler2D shadow_pass;
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
}`;function cv(i,t,e){let n=new Ao;const s=new tt,r=new tt,o=new ue,a=new rv({depthPacking:sf}),l=new av,c={},u=e.maxTextureSize,h={[Yn]:Ue,[Ue]:Yn,[je]:je},d=new Le({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new tt},radius:{value:4}},vertexShader:ov,fragmentShader:lv}),p=d.clone();p.defines.HORIZONTAL_PASS=1;const g=new qt;g.setAttribute("position",new Pe(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const _=new xt(g,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=tu;let f=this.type;this.render=function(w,A,I){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||w.length===0)return;const E=i.getRenderTarget(),y=i.getActiveCubeFace(),L=i.getActiveMipmapLevel(),B=i.state;B.setBlending(Dn),B.buffers.color.setClear(1,1,1,1),B.buffers.depth.setTest(!0),B.setScissorTest(!1);const z=f!==Rn&&this.type===Rn,$=f===Rn&&this.type!==Rn;for(let Y=0,W=w.length;Y<W;Y++){const j=w[Y],X=j.shadow;if(X===void 0){console.warn("THREE.WebGLShadowMap:",j,"has no shadow.");continue}if(X.autoUpdate===!1&&X.needsUpdate===!1)continue;s.copy(X.mapSize);const ht=X.getFrameExtents();if(s.multiply(ht),r.copy(X.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/ht.x),s.x=r.x*ht.x,X.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/ht.y),s.y=r.y*ht.y,X.mapSize.y=r.y)),X.map===null||z===!0||$===!0){const gt=this.type!==Rn?{minFilter:He,magFilter:He}:{};X.map!==null&&X.map.dispose(),X.map=new dn(s.x,s.y,gt),X.map.texture.name=j.name+".shadowMap",X.camera.updateProjectionMatrix()}i.setRenderTarget(X.map),i.clear();const dt=X.getViewportCount();for(let gt=0;gt<dt;gt++){const Gt=X.getViewport(gt);o.set(r.x*Gt.x,r.y*Gt.y,r.x*Gt.z,r.y*Gt.w),B.viewport(o),X.updateMatrices(j,gt),n=X.getFrustum(),T(A,I,X.camera,j,this.type)}X.isPointLightShadow!==!0&&this.type===Rn&&S(X,I),X.needsUpdate=!1}f=this.type,m.needsUpdate=!1,i.setRenderTarget(E,y,L)};function S(w,A){const I=t.update(_);d.defines.VSM_SAMPLES!==w.blurSamples&&(d.defines.VSM_SAMPLES=w.blurSamples,p.defines.VSM_SAMPLES=w.blurSamples,d.needsUpdate=!0,p.needsUpdate=!0),w.mapPass===null&&(w.mapPass=new dn(s.x,s.y)),d.uniforms.shadow_pass.value=w.map.texture,d.uniforms.resolution.value=w.mapSize,d.uniforms.radius.value=w.radius,i.setRenderTarget(w.mapPass),i.clear(),i.renderBufferDirect(A,null,I,d,_,null),p.uniforms.shadow_pass.value=w.mapPass.texture,p.uniforms.resolution.value=w.mapSize,p.uniforms.radius.value=w.radius,i.setRenderTarget(w.map),i.clear(),i.renderBufferDirect(A,null,I,p,_,null)}function x(w,A,I,E){let y=null;const L=I.isPointLight===!0?w.customDistanceMaterial:w.customDepthMaterial;if(L!==void 0)y=L;else if(y=I.isPointLight===!0?l:a,i.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0){const B=y.uuid,z=A.uuid;let $=c[B];$===void 0&&($={},c[B]=$);let Y=$[z];Y===void 0&&(Y=y.clone(),$[z]=Y,A.addEventListener("dispose",P)),y=Y}if(y.visible=A.visible,y.wireframe=A.wireframe,E===Rn?y.side=A.shadowSide!==null?A.shadowSide:A.side:y.side=A.shadowSide!==null?A.shadowSide:h[A.side],y.alphaMap=A.alphaMap,y.alphaTest=A.alphaTest,y.map=A.map,y.clipShadows=A.clipShadows,y.clippingPlanes=A.clippingPlanes,y.clipIntersection=A.clipIntersection,y.displacementMap=A.displacementMap,y.displacementScale=A.displacementScale,y.displacementBias=A.displacementBias,y.wireframeLinewidth=A.wireframeLinewidth,y.linewidth=A.linewidth,I.isPointLight===!0&&y.isMeshDistanceMaterial===!0){const B=i.properties.get(y);B.light=I}return y}function T(w,A,I,E,y){if(w.visible===!1)return;if(w.layers.test(A.layers)&&(w.isMesh||w.isLine||w.isPoints)&&(w.castShadow||w.receiveShadow&&y===Rn)&&(!w.frustumCulled||n.intersectsObject(w))){w.modelViewMatrix.multiplyMatrices(I.matrixWorldInverse,w.matrixWorld);const z=t.update(w),$=w.material;if(Array.isArray($)){const Y=z.groups;for(let W=0,j=Y.length;W<j;W++){const X=Y[W],ht=$[X.materialIndex];if(ht&&ht.visible){const dt=x(w,ht,E,y);w.onBeforeShadow(i,w,A,I,z,dt,X),i.renderBufferDirect(I,null,z,dt,w,X),w.onAfterShadow(i,w,A,I,z,dt,X)}}}else if($.visible){const Y=x(w,$,E,y);w.onBeforeShadow(i,w,A,I,z,Y,null),i.renderBufferDirect(I,null,z,Y,w,null),w.onAfterShadow(i,w,A,I,z,Y,null)}}const B=w.children;for(let z=0,$=B.length;z<$;z++)T(B[z],A,I,E,y)}function P(w){w.target.removeEventListener("dispose",P);for(const I in c){const E=c[I],y=w.target.uuid;y in E&&(E[y].dispose(),delete E[y])}}}function uv(i){function t(){let v=!1;const G=new ue;let O=null;const V=new ue(0,0,0,0);return{setMask:function(Z){O!==Z&&!v&&(i.colorMask(Z,Z,Z,Z),O=Z)},setLocked:function(Z){v=Z},setClear:function(Z,Mt,Rt,pe,_e){_e===!0&&(Z*=pe,Mt*=pe,Rt*=pe),G.set(Z,Mt,Rt,pe),V.equals(G)===!1&&(i.clearColor(Z,Mt,Rt,pe),V.copy(G))},reset:function(){v=!1,O=null,V.set(-1,0,0,0)}}}function e(){let v=!1,G=null,O=null,V=null;return{setTest:function(Z){Z?ft(i.DEPTH_TEST):ot(i.DEPTH_TEST)},setMask:function(Z){G!==Z&&!v&&(i.depthMask(Z),G=Z)},setFunc:function(Z){if(O!==Z){switch(Z){case Od:i.depthFunc(i.NEVER);break;case Fd:i.depthFunc(i.ALWAYS);break;case Bd:i.depthFunc(i.LESS);break;case Cr:i.depthFunc(i.LEQUAL);break;case zd:i.depthFunc(i.EQUAL);break;case kd:i.depthFunc(i.GEQUAL);break;case Hd:i.depthFunc(i.GREATER);break;case Gd:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}O=Z}},setLocked:function(Z){v=Z},setClear:function(Z){V!==Z&&(i.clearDepth(Z),V=Z)},reset:function(){v=!1,G=null,O=null,V=null}}}function n(){let v=!1,G=null,O=null,V=null,Z=null,Mt=null,Rt=null,pe=null,_e=null;return{setTest:function(jt){v||(jt?ft(i.STENCIL_TEST):ot(i.STENCIL_TEST))},setMask:function(jt){G!==jt&&!v&&(i.stencilMask(jt),G=jt)},setFunc:function(jt,xe,ye){(O!==jt||V!==xe||Z!==ye)&&(i.stencilFunc(jt,xe,ye),O=jt,V=xe,Z=ye)},setOp:function(jt,xe,ye){(Mt!==jt||Rt!==xe||pe!==ye)&&(i.stencilOp(jt,xe,ye),Mt=jt,Rt=xe,pe=ye)},setLocked:function(jt){v=jt},setClear:function(jt){_e!==jt&&(i.clearStencil(jt),_e=jt)},reset:function(){v=!1,G=null,O=null,V=null,Z=null,Mt=null,Rt=null,pe=null,_e=null}}}const s=new t,r=new e,o=new n,a=new WeakMap,l=new WeakMap;let c={},u={},h=new WeakMap,d=[],p=null,g=!1,_=null,m=null,f=null,S=null,x=null,T=null,P=null,w=new St(0,0,0),A=0,I=!1,E=null,y=null,L=null,B=null,z=null;const $=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let Y=!1,W=0;const j=i.getParameter(i.VERSION);j.indexOf("WebGL")!==-1?(W=parseFloat(/^WebGL (\d)/.exec(j)[1]),Y=W>=1):j.indexOf("OpenGL ES")!==-1&&(W=parseFloat(/^OpenGL ES (\d)/.exec(j)[1]),Y=W>=2);let X=null,ht={};const dt=i.getParameter(i.SCISSOR_BOX),gt=i.getParameter(i.VIEWPORT),Gt=new ue().fromArray(dt),Yt=new ue().fromArray(gt);function q(v,G,O,V){const Z=new Uint8Array(4),Mt=i.createTexture();i.bindTexture(v,Mt),i.texParameteri(v,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(v,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Rt=0;Rt<O;Rt++)v===i.TEXTURE_3D||v===i.TEXTURE_2D_ARRAY?i.texImage3D(G,0,i.RGBA,1,1,V,0,i.RGBA,i.UNSIGNED_BYTE,Z):i.texImage2D(G+Rt,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,Z);return Mt}const et={};et[i.TEXTURE_2D]=q(i.TEXTURE_2D,i.TEXTURE_2D,1),et[i.TEXTURE_CUBE_MAP]=q(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),et[i.TEXTURE_2D_ARRAY]=q(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),et[i.TEXTURE_3D]=q(i.TEXTURE_3D,i.TEXTURE_3D,1,1),s.setClear(0,0,0,1),r.setClear(1),o.setClear(0),ft(i.DEPTH_TEST),r.setFunc(Cr),Et(!1),Xt(Zo),ft(i.CULL_FACE),Ht(Dn);function ft(v){c[v]!==!0&&(i.enable(v),c[v]=!0)}function ot(v){c[v]!==!1&&(i.disable(v),c[v]=!1)}function Ft(v,G){return u[v]!==G?(i.bindFramebuffer(v,G),u[v]=G,v===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=G),v===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=G),!0):!1}function Pt(v,G){let O=d,V=!1;if(v){O=h.get(G),O===void 0&&(O=[],h.set(G,O));const Z=v.textures;if(O.length!==Z.length||O[0]!==i.COLOR_ATTACHMENT0){for(let Mt=0,Rt=Z.length;Mt<Rt;Mt++)O[Mt]=i.COLOR_ATTACHMENT0+Mt;O.length=Z.length,V=!0}}else O[0]!==i.BACK&&(O[0]=i.BACK,V=!0);V&&i.drawBuffers(O)}function Vt(v){return p!==v?(i.useProgram(v),p=v,!0):!1}const D={[li]:i.FUNC_ADD,[xd]:i.FUNC_SUBTRACT,[yd]:i.FUNC_REVERSE_SUBTRACT};D[Md]=i.MIN,D[Sd]=i.MAX;const Wt={[bd]:i.ZERO,[Ed]:i.ONE,[Td]:i.SRC_COLOR,[no]:i.SRC_ALPHA,[Ld]:i.SRC_ALPHA_SATURATE,[Rd]:i.DST_COLOR,[Ad]:i.DST_ALPHA,[wd]:i.ONE_MINUS_SRC_COLOR,[io]:i.ONE_MINUS_SRC_ALPHA,[Pd]:i.ONE_MINUS_DST_COLOR,[Cd]:i.ONE_MINUS_DST_ALPHA,[Dd]:i.CONSTANT_COLOR,[Id]:i.ONE_MINUS_CONSTANT_COLOR,[Ud]:i.CONSTANT_ALPHA,[Nd]:i.ONE_MINUS_CONSTANT_ALPHA};function Ht(v,G,O,V,Z,Mt,Rt,pe,_e,jt){if(v===Dn){g===!0&&(ot(i.BLEND),g=!1);return}if(g===!1&&(ft(i.BLEND),g=!0),v!==_d){if(v!==_||jt!==I){if((m!==li||x!==li)&&(i.blendEquation(i.FUNC_ADD),m=li,x=li),jt)switch(v){case Qi:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case we:i.blendFunc(i.ONE,i.ONE);break;case Jo:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Qo:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",v);break}else switch(v){case Qi:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case we:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case Jo:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Qo:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",v);break}f=null,S=null,T=null,P=null,w.set(0,0,0),A=0,_=v,I=jt}return}Z=Z||G,Mt=Mt||O,Rt=Rt||V,(G!==m||Z!==x)&&(i.blendEquationSeparate(D[G],D[Z]),m=G,x=Z),(O!==f||V!==S||Mt!==T||Rt!==P)&&(i.blendFuncSeparate(Wt[O],Wt[V],Wt[Mt],Wt[Rt]),f=O,S=V,T=Mt,P=Rt),(pe.equals(w)===!1||_e!==A)&&(i.blendColor(pe.r,pe.g,pe.b,_e),w.copy(pe),A=_e),_=v,I=!1}function ae(v,G){v.side===je?ot(i.CULL_FACE):ft(i.CULL_FACE);let O=v.side===Ue;G&&(O=!O),Et(O),v.blending===Qi&&v.transparent===!1?Ht(Dn):Ht(v.blending,v.blendEquation,v.blendSrc,v.blendDst,v.blendEquationAlpha,v.blendSrcAlpha,v.blendDstAlpha,v.blendColor,v.blendAlpha,v.premultipliedAlpha),r.setFunc(v.depthFunc),r.setTest(v.depthTest),r.setMask(v.depthWrite),s.setMask(v.colorWrite);const V=v.stencilWrite;o.setTest(V),V&&(o.setMask(v.stencilWriteMask),o.setFunc(v.stencilFunc,v.stencilRef,v.stencilFuncMask),o.setOp(v.stencilFail,v.stencilZFail,v.stencilZPass)),Lt(v.polygonOffset,v.polygonOffsetFactor,v.polygonOffsetUnits),v.alphaToCoverage===!0?ft(i.SAMPLE_ALPHA_TO_COVERAGE):ot(i.SAMPLE_ALPHA_TO_COVERAGE)}function Et(v){E!==v&&(v?i.frontFace(i.CW):i.frontFace(i.CCW),E=v)}function Xt(v){v!==gd?(ft(i.CULL_FACE),v!==y&&(v===Zo?i.cullFace(i.BACK):v===vd?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):ot(i.CULL_FACE),y=v}function Bt(v){v!==L&&(Y&&i.lineWidth(v),L=v)}function Lt(v,G,O){v?(ft(i.POLYGON_OFFSET_FILL),(B!==G||z!==O)&&(i.polygonOffset(G,O),B=G,z=O)):ot(i.POLYGON_OFFSET_FILL)}function he(v){v?ft(i.SCISSOR_TEST):ot(i.SCISSOR_TEST)}function R(v){v===void 0&&(v=i.TEXTURE0+$-1),X!==v&&(i.activeTexture(v),X=v)}function M(v,G,O){O===void 0&&(X===null?O=i.TEXTURE0+$-1:O=X);let V=ht[O];V===void 0&&(V={type:void 0,texture:void 0},ht[O]=V),(V.type!==v||V.texture!==G)&&(X!==O&&(i.activeTexture(O),X=O),i.bindTexture(v,G||et[v]),V.type=v,V.texture=G)}function H(){const v=ht[X];v!==void 0&&v.type!==void 0&&(i.bindTexture(v.type,null),v.type=void 0,v.texture=void 0)}function K(){try{i.compressedTexImage2D.apply(i,arguments)}catch(v){console.error("THREE.WebGLState:",v)}}function J(){try{i.compressedTexImage3D.apply(i,arguments)}catch(v){console.error("THREE.WebGLState:",v)}}function Q(){try{i.texSubImage2D.apply(i,arguments)}catch(v){console.error("THREE.WebGLState:",v)}}function yt(){try{i.texSubImage3D.apply(i,arguments)}catch(v){console.error("THREE.WebGLState:",v)}}function rt(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(v){console.error("THREE.WebGLState:",v)}}function st(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(v){console.error("THREE.WebGLState:",v)}}function Dt(){try{i.texStorage2D.apply(i,arguments)}catch(v){console.error("THREE.WebGLState:",v)}}function nt(){try{i.texStorage3D.apply(i,arguments)}catch(v){console.error("THREE.WebGLState:",v)}}function vt(){try{i.texImage2D.apply(i,arguments)}catch(v){console.error("THREE.WebGLState:",v)}}function kt(){try{i.texImage3D.apply(i,arguments)}catch(v){console.error("THREE.WebGLState:",v)}}function wt(v){Gt.equals(v)===!1&&(i.scissor(v.x,v.y,v.z,v.w),Gt.copy(v))}function lt(v){Yt.equals(v)===!1&&(i.viewport(v.x,v.y,v.z,v.w),Yt.copy(v))}function It(v,G){let O=l.get(G);O===void 0&&(O=new WeakMap,l.set(G,O));let V=O.get(v);V===void 0&&(V=i.getUniformBlockIndex(G,v.name),O.set(v,V))}function Ut(v,G){const V=l.get(G).get(v);a.get(G)!==V&&(i.uniformBlockBinding(G,V,v.__bindingPointIndex),a.set(G,V))}function fe(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),c={},X=null,ht={},u={},h=new WeakMap,d=[],p=null,g=!1,_=null,m=null,f=null,S=null,x=null,T=null,P=null,w=new St(0,0,0),A=0,I=!1,E=null,y=null,L=null,B=null,z=null,Gt.set(0,0,i.canvas.width,i.canvas.height),Yt.set(0,0,i.canvas.width,i.canvas.height),s.reset(),r.reset(),o.reset()}return{buffers:{color:s,depth:r,stencil:o},enable:ft,disable:ot,bindFramebuffer:Ft,drawBuffers:Pt,useProgram:Vt,setBlending:Ht,setMaterial:ae,setFlipSided:Et,setCullFace:Xt,setLineWidth:Bt,setPolygonOffset:Lt,setScissorTest:he,activeTexture:R,bindTexture:M,unbindTexture:H,compressedTexImage2D:K,compressedTexImage3D:J,texImage2D:vt,texImage3D:kt,updateUBOMapping:It,uniformBlockBinding:Ut,texStorage2D:Dt,texStorage3D:nt,texSubImage2D:Q,texSubImage3D:yt,compressedTexSubImage2D:rt,compressedTexSubImage3D:st,scissor:wt,viewport:lt,reset:fe}}function hv(i,t,e,n,s,r,o){const a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new tt,u=new WeakMap;let h;const d=new WeakMap;let p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(R,M){return p?new OffscreenCanvas(R,M):Ur("canvas")}function _(R,M,H){let K=1;const J=he(R);if((J.width>H||J.height>H)&&(K=H/Math.max(J.width,J.height)),K<1)if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap||typeof VideoFrame<"u"&&R instanceof VideoFrame){const Q=Math.floor(K*J.width),yt=Math.floor(K*J.height);h===void 0&&(h=g(Q,yt));const rt=M?g(Q,yt):h;return rt.width=Q,rt.height=yt,rt.getContext("2d").drawImage(R,0,0,Q,yt),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+J.width+"x"+J.height+") to ("+Q+"x"+yt+")."),rt}else return"data"in R&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+J.width+"x"+J.height+")."),R;return R}function m(R){return R.generateMipmaps&&R.minFilter!==He&&R.minFilter!==un}function f(R){i.generateMipmap(R)}function S(R,M,H,K,J=!1){if(R!==null){if(i[R]!==void 0)return i[R];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let Q=M;if(M===i.RED&&(H===i.FLOAT&&(Q=i.R32F),H===i.HALF_FLOAT&&(Q=i.R16F),H===i.UNSIGNED_BYTE&&(Q=i.R8)),M===i.RED_INTEGER&&(H===i.UNSIGNED_BYTE&&(Q=i.R8UI),H===i.UNSIGNED_SHORT&&(Q=i.R16UI),H===i.UNSIGNED_INT&&(Q=i.R32UI),H===i.BYTE&&(Q=i.R8I),H===i.SHORT&&(Q=i.R16I),H===i.INT&&(Q=i.R32I)),M===i.RG&&(H===i.FLOAT&&(Q=i.RG32F),H===i.HALF_FLOAT&&(Q=i.RG16F),H===i.UNSIGNED_BYTE&&(Q=i.RG8)),M===i.RG_INTEGER&&(H===i.UNSIGNED_BYTE&&(Q=i.RG8UI),H===i.UNSIGNED_SHORT&&(Q=i.RG16UI),H===i.UNSIGNED_INT&&(Q=i.RG32UI),H===i.BYTE&&(Q=i.RG8I),H===i.SHORT&&(Q=i.RG16I),H===i.INT&&(Q=i.RG32I)),M===i.RGB&&H===i.UNSIGNED_INT_5_9_9_9_REV&&(Q=i.RGB9_E5),M===i.RGBA){const yt=J?Pr:te.getTransfer(K);H===i.FLOAT&&(Q=i.RGBA32F),H===i.HALF_FLOAT&&(Q=i.RGBA16F),H===i.UNSIGNED_BYTE&&(Q=yt===oe?i.SRGB8_ALPHA8:i.RGBA8),H===i.UNSIGNED_SHORT_4_4_4_4&&(Q=i.RGBA4),H===i.UNSIGNED_SHORT_5_5_5_1&&(Q=i.RGB5_A1)}return(Q===i.R16F||Q===i.R32F||Q===i.RG16F||Q===i.RG32F||Q===i.RGBA16F||Q===i.RGBA32F)&&t.get("EXT_color_buffer_float"),Q}function x(R,M){let H;return R?M===null||M===ss||M===rs?H=i.DEPTH24_STENCIL8:M===Pn?H=i.DEPTH32F_STENCIL8:M===Rr&&(H=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):M===null||M===ss||M===rs?H=i.DEPTH_COMPONENT24:M===Pn?H=i.DEPTH_COMPONENT32F:M===Rr&&(H=i.DEPTH_COMPONENT16),H}function T(R,M){return m(R)===!0||R.isFramebufferTexture&&R.minFilter!==He&&R.minFilter!==un?Math.log2(Math.max(M.width,M.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?M.mipmaps.length:1}function P(R){const M=R.target;M.removeEventListener("dispose",P),A(M),M.isVideoTexture&&u.delete(M)}function w(R){const M=R.target;M.removeEventListener("dispose",w),E(M)}function A(R){const M=n.get(R);if(M.__webglInit===void 0)return;const H=R.source,K=d.get(H);if(K){const J=K[M.__cacheKey];J.usedTimes--,J.usedTimes===0&&I(R),Object.keys(K).length===0&&d.delete(H)}n.remove(R)}function I(R){const M=n.get(R);i.deleteTexture(M.__webglTexture);const H=R.source,K=d.get(H);delete K[M.__cacheKey],o.memory.textures--}function E(R){const M=n.get(R);if(R.depthTexture&&R.depthTexture.dispose(),R.isWebGLCubeRenderTarget)for(let K=0;K<6;K++){if(Array.isArray(M.__webglFramebuffer[K]))for(let J=0;J<M.__webglFramebuffer[K].length;J++)i.deleteFramebuffer(M.__webglFramebuffer[K][J]);else i.deleteFramebuffer(M.__webglFramebuffer[K]);M.__webglDepthbuffer&&i.deleteRenderbuffer(M.__webglDepthbuffer[K])}else{if(Array.isArray(M.__webglFramebuffer))for(let K=0;K<M.__webglFramebuffer.length;K++)i.deleteFramebuffer(M.__webglFramebuffer[K]);else i.deleteFramebuffer(M.__webglFramebuffer);if(M.__webglDepthbuffer&&i.deleteRenderbuffer(M.__webglDepthbuffer),M.__webglMultisampledFramebuffer&&i.deleteFramebuffer(M.__webglMultisampledFramebuffer),M.__webglColorRenderbuffer)for(let K=0;K<M.__webglColorRenderbuffer.length;K++)M.__webglColorRenderbuffer[K]&&i.deleteRenderbuffer(M.__webglColorRenderbuffer[K]);M.__webglDepthRenderbuffer&&i.deleteRenderbuffer(M.__webglDepthRenderbuffer)}const H=R.textures;for(let K=0,J=H.length;K<J;K++){const Q=n.get(H[K]);Q.__webglTexture&&(i.deleteTexture(Q.__webglTexture),o.memory.textures--),n.remove(H[K])}n.remove(R)}let y=0;function L(){y=0}function B(){const R=y;return R>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+R+" texture units while this GPU supports only "+s.maxTextures),y+=1,R}function z(R){const M=[];return M.push(R.wrapS),M.push(R.wrapT),M.push(R.wrapR||0),M.push(R.magFilter),M.push(R.minFilter),M.push(R.anisotropy),M.push(R.internalFormat),M.push(R.format),M.push(R.type),M.push(R.generateMipmaps),M.push(R.premultiplyAlpha),M.push(R.flipY),M.push(R.unpackAlignment),M.push(R.colorSpace),M.join()}function $(R,M){const H=n.get(R);if(R.isVideoTexture&&Bt(R),R.isRenderTargetTexture===!1&&R.version>0&&H.__version!==R.version){const K=R.image;if(K===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(K.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Yt(H,R,M);return}}e.bindTexture(i.TEXTURE_2D,H.__webglTexture,i.TEXTURE0+M)}function Y(R,M){const H=n.get(R);if(R.version>0&&H.__version!==R.version){Yt(H,R,M);return}e.bindTexture(i.TEXTURE_2D_ARRAY,H.__webglTexture,i.TEXTURE0+M)}function W(R,M){const H=n.get(R);if(R.version>0&&H.__version!==R.version){Yt(H,R,M);return}e.bindTexture(i.TEXTURE_3D,H.__webglTexture,i.TEXTURE0+M)}function j(R,M){const H=n.get(R);if(R.version>0&&H.__version!==R.version){q(H,R,M);return}e.bindTexture(i.TEXTURE_CUBE_MAP,H.__webglTexture,i.TEXTURE0+M)}const X={[Ls]:i.REPEAT,[ui]:i.CLAMP_TO_EDGE,[ao]:i.MIRRORED_REPEAT},ht={[He]:i.NEAREST,[$d]:i.NEAREST_MIPMAP_NEAREST,[Hs]:i.NEAREST_MIPMAP_LINEAR,[un]:i.LINEAR,[ia]:i.LINEAR_MIPMAP_NEAREST,[hi]:i.LINEAR_MIPMAP_LINEAR},dt={[af]:i.NEVER,[df]:i.ALWAYS,[of]:i.LESS,[vu]:i.LEQUAL,[lf]:i.EQUAL,[hf]:i.GEQUAL,[cf]:i.GREATER,[uf]:i.NOTEQUAL};function gt(R,M){if(M.type===Pn&&t.has("OES_texture_float_linear")===!1&&(M.magFilter===un||M.magFilter===ia||M.magFilter===Hs||M.magFilter===hi||M.minFilter===un||M.minFilter===ia||M.minFilter===Hs||M.minFilter===hi)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(R,i.TEXTURE_WRAP_S,X[M.wrapS]),i.texParameteri(R,i.TEXTURE_WRAP_T,X[M.wrapT]),(R===i.TEXTURE_3D||R===i.TEXTURE_2D_ARRAY)&&i.texParameteri(R,i.TEXTURE_WRAP_R,X[M.wrapR]),i.texParameteri(R,i.TEXTURE_MAG_FILTER,ht[M.magFilter]),i.texParameteri(R,i.TEXTURE_MIN_FILTER,ht[M.minFilter]),M.compareFunction&&(i.texParameteri(R,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(R,i.TEXTURE_COMPARE_FUNC,dt[M.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(M.magFilter===He||M.minFilter!==Hs&&M.minFilter!==hi||M.type===Pn&&t.has("OES_texture_float_linear")===!1)return;if(M.anisotropy>1||n.get(M).__currentAnisotropy){const H=t.get("EXT_texture_filter_anisotropic");i.texParameterf(R,H.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(M.anisotropy,s.getMaxAnisotropy())),n.get(M).__currentAnisotropy=M.anisotropy}}}function Gt(R,M){let H=!1;R.__webglInit===void 0&&(R.__webglInit=!0,M.addEventListener("dispose",P));const K=M.source;let J=d.get(K);J===void 0&&(J={},d.set(K,J));const Q=z(M);if(Q!==R.__cacheKey){J[Q]===void 0&&(J[Q]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,H=!0),J[Q].usedTimes++;const yt=J[R.__cacheKey];yt!==void 0&&(J[R.__cacheKey].usedTimes--,yt.usedTimes===0&&I(M)),R.__cacheKey=Q,R.__webglTexture=J[Q].texture}return H}function Yt(R,M,H){let K=i.TEXTURE_2D;(M.isDataArrayTexture||M.isCompressedArrayTexture)&&(K=i.TEXTURE_2D_ARRAY),M.isData3DTexture&&(K=i.TEXTURE_3D);const J=Gt(R,M),Q=M.source;e.bindTexture(K,R.__webglTexture,i.TEXTURE0+H);const yt=n.get(Q);if(Q.version!==yt.__version||J===!0){e.activeTexture(i.TEXTURE0+H);const rt=te.getPrimaries(te.workingColorSpace),st=M.colorSpace===Vn?null:te.getPrimaries(M.colorSpace),Dt=M.colorSpace===Vn||rt===st?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,M.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,M.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Dt);let nt=_(M.image,!1,s.maxTextureSize);nt=Lt(M,nt);const vt=r.convert(M.format,M.colorSpace),kt=r.convert(M.type);let wt=S(M.internalFormat,vt,kt,M.colorSpace,M.isVideoTexture);gt(K,M);let lt;const It=M.mipmaps,Ut=M.isVideoTexture!==!0,fe=yt.__version===void 0||J===!0,v=Q.dataReady,G=T(M,nt);if(M.isDepthTexture)wt=x(M.format===as,M.type),fe&&(Ut?e.texStorage2D(i.TEXTURE_2D,1,wt,nt.width,nt.height):e.texImage2D(i.TEXTURE_2D,0,wt,nt.width,nt.height,0,vt,kt,null));else if(M.isDataTexture)if(It.length>0){Ut&&fe&&e.texStorage2D(i.TEXTURE_2D,G,wt,It[0].width,It[0].height);for(let O=0,V=It.length;O<V;O++)lt=It[O],Ut?v&&e.texSubImage2D(i.TEXTURE_2D,O,0,0,lt.width,lt.height,vt,kt,lt.data):e.texImage2D(i.TEXTURE_2D,O,wt,lt.width,lt.height,0,vt,kt,lt.data);M.generateMipmaps=!1}else Ut?(fe&&e.texStorage2D(i.TEXTURE_2D,G,wt,nt.width,nt.height),v&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,nt.width,nt.height,vt,kt,nt.data)):e.texImage2D(i.TEXTURE_2D,0,wt,nt.width,nt.height,0,vt,kt,nt.data);else if(M.isCompressedTexture)if(M.isCompressedArrayTexture){Ut&&fe&&e.texStorage3D(i.TEXTURE_2D_ARRAY,G,wt,It[0].width,It[0].height,nt.depth);for(let O=0,V=It.length;O<V;O++)if(lt=It[O],M.format!==yn)if(vt!==null)if(Ut){if(v)if(M.layerUpdates.size>0){for(const Z of M.layerUpdates){const Mt=lt.width*lt.height;e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,O,0,0,Z,lt.width,lt.height,1,vt,lt.data.slice(Mt*Z,Mt*(Z+1)),0,0)}M.clearLayerUpdates()}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,O,0,0,0,lt.width,lt.height,nt.depth,vt,lt.data,0,0)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,O,wt,lt.width,lt.height,nt.depth,0,lt.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ut?v&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,O,0,0,0,lt.width,lt.height,nt.depth,vt,kt,lt.data):e.texImage3D(i.TEXTURE_2D_ARRAY,O,wt,lt.width,lt.height,nt.depth,0,vt,kt,lt.data)}else{Ut&&fe&&e.texStorage2D(i.TEXTURE_2D,G,wt,It[0].width,It[0].height);for(let O=0,V=It.length;O<V;O++)lt=It[O],M.format!==yn?vt!==null?Ut?v&&e.compressedTexSubImage2D(i.TEXTURE_2D,O,0,0,lt.width,lt.height,vt,lt.data):e.compressedTexImage2D(i.TEXTURE_2D,O,wt,lt.width,lt.height,0,lt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ut?v&&e.texSubImage2D(i.TEXTURE_2D,O,0,0,lt.width,lt.height,vt,kt,lt.data):e.texImage2D(i.TEXTURE_2D,O,wt,lt.width,lt.height,0,vt,kt,lt.data)}else if(M.isDataArrayTexture)if(Ut){if(fe&&e.texStorage3D(i.TEXTURE_2D_ARRAY,G,wt,nt.width,nt.height,nt.depth),v)if(M.layerUpdates.size>0){let O;switch(kt){case i.UNSIGNED_BYTE:switch(vt){case i.ALPHA:O=1;break;case i.LUMINANCE:O=1;break;case i.LUMINANCE_ALPHA:O=2;break;case i.RGB:O=3;break;case i.RGBA:O=4;break;default:throw new Error(`Unknown texel size for format ${vt}.`)}break;case i.UNSIGNED_SHORT_4_4_4_4:case i.UNSIGNED_SHORT_5_5_5_1:case i.UNSIGNED_SHORT_5_6_5:O=1;break;default:throw new Error(`Unknown texel size for type ${kt}.`)}const V=nt.width*nt.height*O;for(const Z of M.layerUpdates)e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Z,nt.width,nt.height,1,vt,kt,nt.data.slice(V*Z,V*(Z+1)));M.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,nt.width,nt.height,nt.depth,vt,kt,nt.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,wt,nt.width,nt.height,nt.depth,0,vt,kt,nt.data);else if(M.isData3DTexture)Ut?(fe&&e.texStorage3D(i.TEXTURE_3D,G,wt,nt.width,nt.height,nt.depth),v&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,nt.width,nt.height,nt.depth,vt,kt,nt.data)):e.texImage3D(i.TEXTURE_3D,0,wt,nt.width,nt.height,nt.depth,0,vt,kt,nt.data);else if(M.isFramebufferTexture){if(fe)if(Ut)e.texStorage2D(i.TEXTURE_2D,G,wt,nt.width,nt.height);else{let O=nt.width,V=nt.height;for(let Z=0;Z<G;Z++)e.texImage2D(i.TEXTURE_2D,Z,wt,O,V,0,vt,kt,null),O>>=1,V>>=1}}else if(It.length>0){if(Ut&&fe){const O=he(It[0]);e.texStorage2D(i.TEXTURE_2D,G,wt,O.width,O.height)}for(let O=0,V=It.length;O<V;O++)lt=It[O],Ut?v&&e.texSubImage2D(i.TEXTURE_2D,O,0,0,vt,kt,lt):e.texImage2D(i.TEXTURE_2D,O,wt,vt,kt,lt);M.generateMipmaps=!1}else if(Ut){if(fe){const O=he(nt);e.texStorage2D(i.TEXTURE_2D,G,wt,O.width,O.height)}v&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,vt,kt,nt)}else e.texImage2D(i.TEXTURE_2D,0,wt,vt,kt,nt);m(M)&&f(K),yt.__version=Q.version,M.onUpdate&&M.onUpdate(M)}R.__version=M.version}function q(R,M,H){if(M.image.length!==6)return;const K=Gt(R,M),J=M.source;e.bindTexture(i.TEXTURE_CUBE_MAP,R.__webglTexture,i.TEXTURE0+H);const Q=n.get(J);if(J.version!==Q.__version||K===!0){e.activeTexture(i.TEXTURE0+H);const yt=te.getPrimaries(te.workingColorSpace),rt=M.colorSpace===Vn?null:te.getPrimaries(M.colorSpace),st=M.colorSpace===Vn||yt===rt?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,M.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,M.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,st);const Dt=M.isCompressedTexture||M.image[0].isCompressedTexture,nt=M.image[0]&&M.image[0].isDataTexture,vt=[];for(let V=0;V<6;V++)!Dt&&!nt?vt[V]=_(M.image[V],!0,s.maxCubemapSize):vt[V]=nt?M.image[V].image:M.image[V],vt[V]=Lt(M,vt[V]);const kt=vt[0],wt=r.convert(M.format,M.colorSpace),lt=r.convert(M.type),It=S(M.internalFormat,wt,lt,M.colorSpace),Ut=M.isVideoTexture!==!0,fe=Q.__version===void 0||K===!0,v=J.dataReady;let G=T(M,kt);gt(i.TEXTURE_CUBE_MAP,M);let O;if(Dt){Ut&&fe&&e.texStorage2D(i.TEXTURE_CUBE_MAP,G,It,kt.width,kt.height);for(let V=0;V<6;V++){O=vt[V].mipmaps;for(let Z=0;Z<O.length;Z++){const Mt=O[Z];M.format!==yn?wt!==null?Ut?v&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+V,Z,0,0,Mt.width,Mt.height,wt,Mt.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+V,Z,It,Mt.width,Mt.height,0,Mt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ut?v&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+V,Z,0,0,Mt.width,Mt.height,wt,lt,Mt.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+V,Z,It,Mt.width,Mt.height,0,wt,lt,Mt.data)}}}else{if(O=M.mipmaps,Ut&&fe){O.length>0&&G++;const V=he(vt[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,G,It,V.width,V.height)}for(let V=0;V<6;V++)if(nt){Ut?v&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+V,0,0,0,vt[V].width,vt[V].height,wt,lt,vt[V].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+V,0,It,vt[V].width,vt[V].height,0,wt,lt,vt[V].data);for(let Z=0;Z<O.length;Z++){const Rt=O[Z].image[V].image;Ut?v&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+V,Z+1,0,0,Rt.width,Rt.height,wt,lt,Rt.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+V,Z+1,It,Rt.width,Rt.height,0,wt,lt,Rt.data)}}else{Ut?v&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+V,0,0,0,wt,lt,vt[V]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+V,0,It,wt,lt,vt[V]);for(let Z=0;Z<O.length;Z++){const Mt=O[Z];Ut?v&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+V,Z+1,0,0,wt,lt,Mt.image[V]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+V,Z+1,It,wt,lt,Mt.image[V])}}}m(M)&&f(i.TEXTURE_CUBE_MAP),Q.__version=J.version,M.onUpdate&&M.onUpdate(M)}R.__version=M.version}function et(R,M,H,K,J,Q){const yt=r.convert(H.format,H.colorSpace),rt=r.convert(H.type),st=S(H.internalFormat,yt,rt,H.colorSpace);if(!n.get(M).__hasExternalTextures){const nt=Math.max(1,M.width>>Q),vt=Math.max(1,M.height>>Q);J===i.TEXTURE_3D||J===i.TEXTURE_2D_ARRAY?e.texImage3D(J,Q,st,nt,vt,M.depth,0,yt,rt,null):e.texImage2D(J,Q,st,nt,vt,0,yt,rt,null)}e.bindFramebuffer(i.FRAMEBUFFER,R),Xt(M)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,K,J,n.get(H).__webglTexture,0,Et(M)):(J===i.TEXTURE_2D||J>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&J<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,K,J,n.get(H).__webglTexture,Q),e.bindFramebuffer(i.FRAMEBUFFER,null)}function ft(R,M,H){if(i.bindRenderbuffer(i.RENDERBUFFER,R),M.depthBuffer){const K=M.depthTexture,J=K&&K.isDepthTexture?K.type:null,Q=x(M.stencilBuffer,J),yt=M.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,rt=Et(M);Xt(M)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,rt,Q,M.width,M.height):H?i.renderbufferStorageMultisample(i.RENDERBUFFER,rt,Q,M.width,M.height):i.renderbufferStorage(i.RENDERBUFFER,Q,M.width,M.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,yt,i.RENDERBUFFER,R)}else{const K=M.textures;for(let J=0;J<K.length;J++){const Q=K[J],yt=r.convert(Q.format,Q.colorSpace),rt=r.convert(Q.type),st=S(Q.internalFormat,yt,rt,Q.colorSpace),Dt=Et(M);H&&Xt(M)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,Dt,st,M.width,M.height):Xt(M)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Dt,st,M.width,M.height):i.renderbufferStorage(i.RENDERBUFFER,st,M.width,M.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function ot(R,M){if(M&&M.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(i.FRAMEBUFFER,R),!(M.depthTexture&&M.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!n.get(M.depthTexture).__webglTexture||M.depthTexture.image.width!==M.width||M.depthTexture.image.height!==M.height)&&(M.depthTexture.image.width=M.width,M.depthTexture.image.height=M.height,M.depthTexture.needsUpdate=!0),$(M.depthTexture,0);const K=n.get(M.depthTexture).__webglTexture,J=Et(M);if(M.depthTexture.format===ts)Xt(M)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,K,0,J):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,K,0);else if(M.depthTexture.format===as)Xt(M)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,K,0,J):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,K,0);else throw new Error("Unknown depthTexture format")}function Ft(R){const M=n.get(R),H=R.isWebGLCubeRenderTarget===!0;if(R.depthTexture&&!M.__autoAllocateDepthBuffer){if(H)throw new Error("target.depthTexture not supported in Cube render targets");ot(M.__webglFramebuffer,R)}else if(H){M.__webglDepthbuffer=[];for(let K=0;K<6;K++)e.bindFramebuffer(i.FRAMEBUFFER,M.__webglFramebuffer[K]),M.__webglDepthbuffer[K]=i.createRenderbuffer(),ft(M.__webglDepthbuffer[K],R,!1)}else e.bindFramebuffer(i.FRAMEBUFFER,M.__webglFramebuffer),M.__webglDepthbuffer=i.createRenderbuffer(),ft(M.__webglDepthbuffer,R,!1);e.bindFramebuffer(i.FRAMEBUFFER,null)}function Pt(R,M,H){const K=n.get(R);M!==void 0&&et(K.__webglFramebuffer,R,R.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),H!==void 0&&Ft(R)}function Vt(R){const M=R.texture,H=n.get(R),K=n.get(M);R.addEventListener("dispose",w);const J=R.textures,Q=R.isWebGLCubeRenderTarget===!0,yt=J.length>1;if(yt||(K.__webglTexture===void 0&&(K.__webglTexture=i.createTexture()),K.__version=M.version,o.memory.textures++),Q){H.__webglFramebuffer=[];for(let rt=0;rt<6;rt++)if(M.mipmaps&&M.mipmaps.length>0){H.__webglFramebuffer[rt]=[];for(let st=0;st<M.mipmaps.length;st++)H.__webglFramebuffer[rt][st]=i.createFramebuffer()}else H.__webglFramebuffer[rt]=i.createFramebuffer()}else{if(M.mipmaps&&M.mipmaps.length>0){H.__webglFramebuffer=[];for(let rt=0;rt<M.mipmaps.length;rt++)H.__webglFramebuffer[rt]=i.createFramebuffer()}else H.__webglFramebuffer=i.createFramebuffer();if(yt)for(let rt=0,st=J.length;rt<st;rt++){const Dt=n.get(J[rt]);Dt.__webglTexture===void 0&&(Dt.__webglTexture=i.createTexture(),o.memory.textures++)}if(R.samples>0&&Xt(R)===!1){H.__webglMultisampledFramebuffer=i.createFramebuffer(),H.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,H.__webglMultisampledFramebuffer);for(let rt=0;rt<J.length;rt++){const st=J[rt];H.__webglColorRenderbuffer[rt]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,H.__webglColorRenderbuffer[rt]);const Dt=r.convert(st.format,st.colorSpace),nt=r.convert(st.type),vt=S(st.internalFormat,Dt,nt,st.colorSpace,R.isXRRenderTarget===!0),kt=Et(R);i.renderbufferStorageMultisample(i.RENDERBUFFER,kt,vt,R.width,R.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+rt,i.RENDERBUFFER,H.__webglColorRenderbuffer[rt])}i.bindRenderbuffer(i.RENDERBUFFER,null),R.depthBuffer&&(H.__webglDepthRenderbuffer=i.createRenderbuffer(),ft(H.__webglDepthRenderbuffer,R,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(Q){e.bindTexture(i.TEXTURE_CUBE_MAP,K.__webglTexture),gt(i.TEXTURE_CUBE_MAP,M);for(let rt=0;rt<6;rt++)if(M.mipmaps&&M.mipmaps.length>0)for(let st=0;st<M.mipmaps.length;st++)et(H.__webglFramebuffer[rt][st],R,M,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+rt,st);else et(H.__webglFramebuffer[rt],R,M,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+rt,0);m(M)&&f(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(yt){for(let rt=0,st=J.length;rt<st;rt++){const Dt=J[rt],nt=n.get(Dt);e.bindTexture(i.TEXTURE_2D,nt.__webglTexture),gt(i.TEXTURE_2D,Dt),et(H.__webglFramebuffer,R,Dt,i.COLOR_ATTACHMENT0+rt,i.TEXTURE_2D,0),m(Dt)&&f(i.TEXTURE_2D)}e.unbindTexture()}else{let rt=i.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(rt=R.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(rt,K.__webglTexture),gt(rt,M),M.mipmaps&&M.mipmaps.length>0)for(let st=0;st<M.mipmaps.length;st++)et(H.__webglFramebuffer[st],R,M,i.COLOR_ATTACHMENT0,rt,st);else et(H.__webglFramebuffer,R,M,i.COLOR_ATTACHMENT0,rt,0);m(M)&&f(rt),e.unbindTexture()}R.depthBuffer&&Ft(R)}function D(R){const M=R.textures;for(let H=0,K=M.length;H<K;H++){const J=M[H];if(m(J)){const Q=R.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:i.TEXTURE_2D,yt=n.get(J).__webglTexture;e.bindTexture(Q,yt),f(Q),e.unbindTexture()}}}const Wt=[],Ht=[];function ae(R){if(R.samples>0){if(Xt(R)===!1){const M=R.textures,H=R.width,K=R.height;let J=i.COLOR_BUFFER_BIT;const Q=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,yt=n.get(R),rt=M.length>1;if(rt)for(let st=0;st<M.length;st++)e.bindFramebuffer(i.FRAMEBUFFER,yt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+st,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,yt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+st,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,yt.__webglMultisampledFramebuffer),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,yt.__webglFramebuffer);for(let st=0;st<M.length;st++){if(R.resolveDepthBuffer&&(R.depthBuffer&&(J|=i.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&(J|=i.STENCIL_BUFFER_BIT)),rt){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,yt.__webglColorRenderbuffer[st]);const Dt=n.get(M[st]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Dt,0)}i.blitFramebuffer(0,0,H,K,0,0,H,K,J,i.NEAREST),l===!0&&(Wt.length=0,Ht.length=0,Wt.push(i.COLOR_ATTACHMENT0+st),R.depthBuffer&&R.resolveDepthBuffer===!1&&(Wt.push(Q),Ht.push(Q),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,Ht)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Wt))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),rt)for(let st=0;st<M.length;st++){e.bindFramebuffer(i.FRAMEBUFFER,yt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+st,i.RENDERBUFFER,yt.__webglColorRenderbuffer[st]);const Dt=n.get(M[st]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,yt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+st,i.TEXTURE_2D,Dt,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,yt.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.resolveDepthBuffer===!1&&l){const M=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[M])}}}function Et(R){return Math.min(s.maxSamples,R.samples)}function Xt(R){const M=n.get(R);return R.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&M.__useRenderToTexture!==!1}function Bt(R){const M=o.render.frame;u.get(R)!==M&&(u.set(R,M),R.update())}function Lt(R,M){const H=R.colorSpace,K=R.format,J=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||H!==Kn&&H!==Vn&&(te.getTransfer(H)===oe?(K!==yn||J!==jn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",H)),M}function he(R){return typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement?(c.width=R.naturalWidth||R.width,c.height=R.naturalHeight||R.height):typeof VideoFrame<"u"&&R instanceof VideoFrame?(c.width=R.displayWidth,c.height=R.displayHeight):(c.width=R.width,c.height=R.height),c}this.allocateTextureUnit=B,this.resetTextureUnits=L,this.setTexture2D=$,this.setTexture2DArray=Y,this.setTexture3D=W,this.setTextureCube=j,this.rebindTextures=Pt,this.setupRenderTarget=Vt,this.updateRenderTargetMipmap=D,this.updateMultisampleRenderTarget=ae,this.setupDepthRenderbuffer=Ft,this.setupFrameBufferTexture=et,this.useMultisampledRTT=Xt}function dv(i,t){function e(n,s=Vn){let r;const o=te.getTransfer(s);if(n===jn)return i.UNSIGNED_BYTE;if(n===uu)return i.UNSIGNED_SHORT_4_4_4_4;if(n===hu)return i.UNSIGNED_SHORT_5_5_5_1;if(n===jd)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===qd)return i.BYTE;if(n===Yd)return i.SHORT;if(n===Rr)return i.UNSIGNED_SHORT;if(n===cu)return i.INT;if(n===ss)return i.UNSIGNED_INT;if(n===Pn)return i.FLOAT;if(n===$n)return i.HALF_FLOAT;if(n===Kd)return i.ALPHA;if(n===Zd)return i.RGB;if(n===yn)return i.RGBA;if(n===Jd)return i.LUMINANCE;if(n===Qd)return i.LUMINANCE_ALPHA;if(n===ts)return i.DEPTH_COMPONENT;if(n===as)return i.DEPTH_STENCIL;if(n===du)return i.RED;if(n===fu)return i.RED_INTEGER;if(n===tf)return i.RG;if(n===pu)return i.RG_INTEGER;if(n===mu)return i.RGBA_INTEGER;if(n===sa||n===ra||n===aa||n===oa)if(o===oe)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===sa)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===ra)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===aa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===oa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===sa)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===ra)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===aa)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===oa)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===tl||n===el||n===nl||n===il)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===tl)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===el)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===nl)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===il)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===sl||n===rl||n===al)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===sl||n===rl)return o===oe?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===al)return o===oe?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===ol||n===ll||n===cl||n===ul||n===hl||n===dl||n===fl||n===pl||n===ml||n===gl||n===vl||n===_l||n===xl||n===yl)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===ol)return o===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===ll)return o===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===cl)return o===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===ul)return o===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===hl)return o===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===dl)return o===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===fl)return o===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===pl)return o===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===ml)return o===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===gl)return o===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===vl)return o===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===_l)return o===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===xl)return o===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===yl)return o===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===la||n===Ml||n===Sl)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===la)return o===oe?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Ml)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Sl)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===ef||n===bl||n===El||n===Tl)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===la)return r.COMPRESSED_RED_RGTC1_EXT;if(n===bl)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===El)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Tl)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===rs?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}class fv extends nn{constructor(t=[]){super(),this.isArrayCamera=!0,this.cameras=t}}class de extends ce{constructor(){super(),this.isGroup=!0,this.type="Group"}}const pv={type:"move"};class Ua{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new de,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new de,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new C,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new C),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new de,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new C,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new C),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const e=this._hand;if(e)for(const n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){o=!0;for(const _ of t.hand.values()){const m=e.getJointPose(_,n),f=this._getHandJoint(c,_);m!==null&&(f.matrix.fromArray(m.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,f.jointRadius=m.radius),f.visible=m!==null}const u=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],d=u.position.distanceTo(h.position),p=.02,g=.005;c.inputState.pinching&&d>p+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&d<=p-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(pv)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){const n=new de;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}}const mv=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,gv=`
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

}`;class vv{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e,n){if(this.texture===null){const s=new Ne,r=t.properties.get(s);r.__webglTexture=e.texture,(e.depthNear!=n.depthNear||e.depthFar!=n.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=s}}getMesh(t){if(this.texture!==null&&this.mesh===null){const e=t.cameras[0].viewport,n=new Le({vertexShader:mv,fragmentShader:gv,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new xt(new pi(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}}class _v extends _i{constructor(t,e){super();const n=this;let s=null,r=1,o=null,a="local-floor",l=1,c=null,u=null,h=null,d=null,p=null,g=null;const _=new vv,m=e.getContextAttributes();let f=null,S=null;const x=[],T=[],P=new tt;let w=null;const A=new nn;A.layers.enable(1),A.viewport=new ue;const I=new nn;I.layers.enable(2),I.viewport=new ue;const E=[A,I],y=new fv;y.layers.enable(1),y.layers.enable(2);let L=null,B=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(q){let et=x[q];return et===void 0&&(et=new Ua,x[q]=et),et.getTargetRaySpace()},this.getControllerGrip=function(q){let et=x[q];return et===void 0&&(et=new Ua,x[q]=et),et.getGripSpace()},this.getHand=function(q){let et=x[q];return et===void 0&&(et=new Ua,x[q]=et),et.getHandSpace()};function z(q){const et=T.indexOf(q.inputSource);if(et===-1)return;const ft=x[et];ft!==void 0&&(ft.update(q.inputSource,q.frame,c||o),ft.dispatchEvent({type:q.type,data:q.inputSource}))}function $(){s.removeEventListener("select",z),s.removeEventListener("selectstart",z),s.removeEventListener("selectend",z),s.removeEventListener("squeeze",z),s.removeEventListener("squeezestart",z),s.removeEventListener("squeezeend",z),s.removeEventListener("end",$),s.removeEventListener("inputsourceschange",Y);for(let q=0;q<x.length;q++){const et=T[q];et!==null&&(T[q]=null,x[q].disconnect(et))}L=null,B=null,_.reset(),t.setRenderTarget(f),p=null,d=null,h=null,s=null,S=null,Yt.stop(),n.isPresenting=!1,t.setPixelRatio(w),t.setSize(P.width,P.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(q){r=q,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(q){a=q,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(q){c=q},this.getBaseLayer=function(){return d!==null?d:p},this.getBinding=function(){return h},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(q){if(s=q,s!==null){if(f=t.getRenderTarget(),s.addEventListener("select",z),s.addEventListener("selectstart",z),s.addEventListener("selectend",z),s.addEventListener("squeeze",z),s.addEventListener("squeezestart",z),s.addEventListener("squeezeend",z),s.addEventListener("end",$),s.addEventListener("inputsourceschange",Y),m.xrCompatible!==!0&&await e.makeXRCompatible(),w=t.getPixelRatio(),t.getSize(P),s.renderState.layers===void 0){const et={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(s,e,et),s.updateRenderState({baseLayer:p}),t.setPixelRatio(1),t.setSize(p.framebufferWidth,p.framebufferHeight,!1),S=new dn(p.framebufferWidth,p.framebufferHeight,{format:yn,type:jn,colorSpace:t.outputColorSpace,stencilBuffer:m.stencil})}else{let et=null,ft=null,ot=null;m.depth&&(ot=m.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,et=m.stencil?as:ts,ft=m.stencil?rs:ss);const Ft={colorFormat:e.RGBA8,depthFormat:ot,scaleFactor:r};h=new XRWebGLBinding(s,e),d=h.createProjectionLayer(Ft),s.updateRenderState({layers:[d]}),t.setPixelRatio(1),t.setSize(d.textureWidth,d.textureHeight,!1),S=new dn(d.textureWidth,d.textureHeight,{format:yn,type:jn,depthTexture:new Cu(d.textureWidth,d.textureHeight,ft,void 0,void 0,void 0,void 0,void 0,void 0,et),stencilBuffer:m.stencil,colorSpace:t.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1})}S.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),Yt.setContext(s),Yt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode};function Y(q){for(let et=0;et<q.removed.length;et++){const ft=q.removed[et],ot=T.indexOf(ft);ot>=0&&(T[ot]=null,x[ot].disconnect(ft))}for(let et=0;et<q.added.length;et++){const ft=q.added[et];let ot=T.indexOf(ft);if(ot===-1){for(let Pt=0;Pt<x.length;Pt++)if(Pt>=T.length){T.push(ft),ot=Pt;break}else if(T[Pt]===null){T[Pt]=ft,ot=Pt;break}if(ot===-1)break}const Ft=x[ot];Ft&&Ft.connect(ft)}}const W=new C,j=new C;function X(q,et,ft){W.setFromMatrixPosition(et.matrixWorld),j.setFromMatrixPosition(ft.matrixWorld);const ot=W.distanceTo(j),Ft=et.projectionMatrix.elements,Pt=ft.projectionMatrix.elements,Vt=Ft[14]/(Ft[10]-1),D=Ft[14]/(Ft[10]+1),Wt=(Ft[9]+1)/Ft[5],Ht=(Ft[9]-1)/Ft[5],ae=(Ft[8]-1)/Ft[0],Et=(Pt[8]+1)/Pt[0],Xt=Vt*ae,Bt=Vt*Et,Lt=ot/(-ae+Et),he=Lt*-ae;et.matrixWorld.decompose(q.position,q.quaternion,q.scale),q.translateX(he),q.translateZ(Lt),q.matrixWorld.compose(q.position,q.quaternion,q.scale),q.matrixWorldInverse.copy(q.matrixWorld).invert();const R=Vt+Lt,M=D+Lt,H=Xt-he,K=Bt+(ot-he),J=Wt*D/M*R,Q=Ht*D/M*R;q.projectionMatrix.makePerspective(H,K,J,Q,R,M),q.projectionMatrixInverse.copy(q.projectionMatrix).invert()}function ht(q,et){et===null?q.matrixWorld.copy(q.matrix):q.matrixWorld.multiplyMatrices(et.matrixWorld,q.matrix),q.matrixWorldInverse.copy(q.matrixWorld).invert()}this.updateCamera=function(q){if(s===null)return;_.texture!==null&&(q.near=_.depthNear,q.far=_.depthFar),y.near=I.near=A.near=q.near,y.far=I.far=A.far=q.far,(L!==y.near||B!==y.far)&&(s.updateRenderState({depthNear:y.near,depthFar:y.far}),L=y.near,B=y.far,A.near=L,A.far=B,I.near=L,I.far=B,A.updateProjectionMatrix(),I.updateProjectionMatrix(),q.updateProjectionMatrix());const et=q.parent,ft=y.cameras;ht(y,et);for(let ot=0;ot<ft.length;ot++)ht(ft[ot],et);ft.length===2?X(y,A,I):y.projectionMatrix.copy(A.projectionMatrix),dt(q,y,et)};function dt(q,et,ft){ft===null?q.matrix.copy(et.matrixWorld):(q.matrix.copy(ft.matrixWorld),q.matrix.invert(),q.matrix.multiply(et.matrixWorld)),q.matrix.decompose(q.position,q.quaternion,q.scale),q.updateMatrixWorld(!0),q.projectionMatrix.copy(et.projectionMatrix),q.projectionMatrixInverse.copy(et.projectionMatrixInverse),q.isPerspectiveCamera&&(q.fov=lo*2*Math.atan(1/q.projectionMatrix.elements[5]),q.zoom=1)}this.getCamera=function(){return y},this.getFoveation=function(){if(!(d===null&&p===null))return l},this.setFoveation=function(q){l=q,d!==null&&(d.fixedFoveation=q),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=q)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(y)};let gt=null;function Gt(q,et){if(u=et.getViewerPose(c||o),g=et,u!==null){const ft=u.views;p!==null&&(t.setRenderTargetFramebuffer(S,p.framebuffer),t.setRenderTarget(S));let ot=!1;ft.length!==y.cameras.length&&(y.cameras.length=0,ot=!0);for(let Pt=0;Pt<ft.length;Pt++){const Vt=ft[Pt];let D=null;if(p!==null)D=p.getViewport(Vt);else{const Ht=h.getViewSubImage(d,Vt);D=Ht.viewport,Pt===0&&(t.setRenderTargetTextures(S,Ht.colorTexture,d.ignoreDepthValues?void 0:Ht.depthStencilTexture),t.setRenderTarget(S))}let Wt=E[Pt];Wt===void 0&&(Wt=new nn,Wt.layers.enable(Pt),Wt.viewport=new ue,E[Pt]=Wt),Wt.matrix.fromArray(Vt.transform.matrix),Wt.matrix.decompose(Wt.position,Wt.quaternion,Wt.scale),Wt.projectionMatrix.fromArray(Vt.projectionMatrix),Wt.projectionMatrixInverse.copy(Wt.projectionMatrix).invert(),Wt.viewport.set(D.x,D.y,D.width,D.height),Pt===0&&(y.matrix.copy(Wt.matrix),y.matrix.decompose(y.position,y.quaternion,y.scale)),ot===!0&&y.cameras.push(Wt)}const Ft=s.enabledFeatures;if(Ft&&Ft.includes("depth-sensing")){const Pt=h.getDepthInformation(ft[0]);Pt&&Pt.isValid&&Pt.texture&&_.init(t,Pt,s.renderState)}}for(let ft=0;ft<x.length;ft++){const ot=T[ft],Ft=x[ft];ot!==null&&Ft!==void 0&&Ft.update(ot,et,c||o)}gt&&gt(q,et),et.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:et}),g=null}const Yt=new Au;Yt.setAnimationLoop(Gt),this.setAnimationLoop=function(q){gt=q},this.dispose=function(){}}}const ai=new Mn,xv=new Jt;function yv(i,t){function e(m,f){m.matrixAutoUpdate===!0&&m.updateMatrix(),f.value.copy(m.matrix)}function n(m,f){f.color.getRGB(m.fogColor.value,Eu(i)),f.isFog?(m.fogNear.value=f.near,m.fogFar.value=f.far):f.isFogExp2&&(m.fogDensity.value=f.density)}function s(m,f,S,x,T){f.isMeshBasicMaterial||f.isMeshLambertMaterial?r(m,f):f.isMeshToonMaterial?(r(m,f),h(m,f)):f.isMeshPhongMaterial?(r(m,f),u(m,f)):f.isMeshStandardMaterial?(r(m,f),d(m,f),f.isMeshPhysicalMaterial&&p(m,f,T)):f.isMeshMatcapMaterial?(r(m,f),g(m,f)):f.isMeshDepthMaterial?r(m,f):f.isMeshDistanceMaterial?(r(m,f),_(m,f)):f.isMeshNormalMaterial?r(m,f):f.isLineBasicMaterial?(o(m,f),f.isLineDashedMaterial&&a(m,f)):f.isPointsMaterial?l(m,f,S,x):f.isSpriteMaterial?c(m,f):f.isShadowMaterial?(m.color.value.copy(f.color),m.opacity.value=f.opacity):f.isShaderMaterial&&(f.uniformsNeedUpdate=!1)}function r(m,f){m.opacity.value=f.opacity,f.color&&m.diffuse.value.copy(f.color),f.emissive&&m.emissive.value.copy(f.emissive).multiplyScalar(f.emissiveIntensity),f.map&&(m.map.value=f.map,e(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,e(f.alphaMap,m.alphaMapTransform)),f.bumpMap&&(m.bumpMap.value=f.bumpMap,e(f.bumpMap,m.bumpMapTransform),m.bumpScale.value=f.bumpScale,f.side===Ue&&(m.bumpScale.value*=-1)),f.normalMap&&(m.normalMap.value=f.normalMap,e(f.normalMap,m.normalMapTransform),m.normalScale.value.copy(f.normalScale),f.side===Ue&&m.normalScale.value.negate()),f.displacementMap&&(m.displacementMap.value=f.displacementMap,e(f.displacementMap,m.displacementMapTransform),m.displacementScale.value=f.displacementScale,m.displacementBias.value=f.displacementBias),f.emissiveMap&&(m.emissiveMap.value=f.emissiveMap,e(f.emissiveMap,m.emissiveMapTransform)),f.specularMap&&(m.specularMap.value=f.specularMap,e(f.specularMap,m.specularMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest);const S=t.get(f),x=S.envMap,T=S.envMapRotation;x&&(m.envMap.value=x,ai.copy(T),ai.x*=-1,ai.y*=-1,ai.z*=-1,x.isCubeTexture&&x.isRenderTargetTexture===!1&&(ai.y*=-1,ai.z*=-1),m.envMapRotation.value.setFromMatrix4(xv.makeRotationFromEuler(ai)),m.flipEnvMap.value=x.isCubeTexture&&x.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=f.reflectivity,m.ior.value=f.ior,m.refractionRatio.value=f.refractionRatio),f.lightMap&&(m.lightMap.value=f.lightMap,m.lightMapIntensity.value=f.lightMapIntensity,e(f.lightMap,m.lightMapTransform)),f.aoMap&&(m.aoMap.value=f.aoMap,m.aoMapIntensity.value=f.aoMapIntensity,e(f.aoMap,m.aoMapTransform))}function o(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,f.map&&(m.map.value=f.map,e(f.map,m.mapTransform))}function a(m,f){m.dashSize.value=f.dashSize,m.totalSize.value=f.dashSize+f.gapSize,m.scale.value=f.scale}function l(m,f,S,x){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.size.value=f.size*S,m.scale.value=x*.5,f.map&&(m.map.value=f.map,e(f.map,m.uvTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,e(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function c(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.rotation.value=f.rotation,f.map&&(m.map.value=f.map,e(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,e(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function u(m,f){m.specular.value.copy(f.specular),m.shininess.value=Math.max(f.shininess,1e-4)}function h(m,f){f.gradientMap&&(m.gradientMap.value=f.gradientMap)}function d(m,f){m.metalness.value=f.metalness,f.metalnessMap&&(m.metalnessMap.value=f.metalnessMap,e(f.metalnessMap,m.metalnessMapTransform)),m.roughness.value=f.roughness,f.roughnessMap&&(m.roughnessMap.value=f.roughnessMap,e(f.roughnessMap,m.roughnessMapTransform)),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)}function p(m,f,S){m.ior.value=f.ior,f.sheen>0&&(m.sheenColor.value.copy(f.sheenColor).multiplyScalar(f.sheen),m.sheenRoughness.value=f.sheenRoughness,f.sheenColorMap&&(m.sheenColorMap.value=f.sheenColorMap,e(f.sheenColorMap,m.sheenColorMapTransform)),f.sheenRoughnessMap&&(m.sheenRoughnessMap.value=f.sheenRoughnessMap,e(f.sheenRoughnessMap,m.sheenRoughnessMapTransform))),f.clearcoat>0&&(m.clearcoat.value=f.clearcoat,m.clearcoatRoughness.value=f.clearcoatRoughness,f.clearcoatMap&&(m.clearcoatMap.value=f.clearcoatMap,e(f.clearcoatMap,m.clearcoatMapTransform)),f.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=f.clearcoatRoughnessMap,e(f.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),f.clearcoatNormalMap&&(m.clearcoatNormalMap.value=f.clearcoatNormalMap,e(f.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(f.clearcoatNormalScale),f.side===Ue&&m.clearcoatNormalScale.value.negate())),f.dispersion>0&&(m.dispersion.value=f.dispersion),f.iridescence>0&&(m.iridescence.value=f.iridescence,m.iridescenceIOR.value=f.iridescenceIOR,m.iridescenceThicknessMinimum.value=f.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=f.iridescenceThicknessRange[1],f.iridescenceMap&&(m.iridescenceMap.value=f.iridescenceMap,e(f.iridescenceMap,m.iridescenceMapTransform)),f.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=f.iridescenceThicknessMap,e(f.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),f.transmission>0&&(m.transmission.value=f.transmission,m.transmissionSamplerMap.value=S.texture,m.transmissionSamplerSize.value.set(S.width,S.height),f.transmissionMap&&(m.transmissionMap.value=f.transmissionMap,e(f.transmissionMap,m.transmissionMapTransform)),m.thickness.value=f.thickness,f.thicknessMap&&(m.thicknessMap.value=f.thicknessMap,e(f.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=f.attenuationDistance,m.attenuationColor.value.copy(f.attenuationColor)),f.anisotropy>0&&(m.anisotropyVector.value.set(f.anisotropy*Math.cos(f.anisotropyRotation),f.anisotropy*Math.sin(f.anisotropyRotation)),f.anisotropyMap&&(m.anisotropyMap.value=f.anisotropyMap,e(f.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=f.specularIntensity,m.specularColor.value.copy(f.specularColor),f.specularColorMap&&(m.specularColorMap.value=f.specularColorMap,e(f.specularColorMap,m.specularColorMapTransform)),f.specularIntensityMap&&(m.specularIntensityMap.value=f.specularIntensityMap,e(f.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,f){f.matcap&&(m.matcap.value=f.matcap)}function _(m,f){const S=t.get(f).light;m.referencePosition.value.setFromMatrixPosition(S.matrixWorld),m.nearDistance.value=S.shadow.camera.near,m.farDistance.value=S.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function Mv(i,t,e,n){let s={},r={},o=[];const a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(S,x){const T=x.program;n.uniformBlockBinding(S,T)}function c(S,x){let T=s[S.id];T===void 0&&(g(S),T=u(S),s[S.id]=T,S.addEventListener("dispose",m));const P=x.program;n.updateUBOMapping(S,P);const w=t.render.frame;r[S.id]!==w&&(d(S),r[S.id]=w)}function u(S){const x=h();S.__bindingPointIndex=x;const T=i.createBuffer(),P=S.__size,w=S.usage;return i.bindBuffer(i.UNIFORM_BUFFER,T),i.bufferData(i.UNIFORM_BUFFER,P,w),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,x,T),T}function h(){for(let S=0;S<a;S++)if(o.indexOf(S)===-1)return o.push(S),S;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(S){const x=s[S.id],T=S.uniforms,P=S.__cache;i.bindBuffer(i.UNIFORM_BUFFER,x);for(let w=0,A=T.length;w<A;w++){const I=Array.isArray(T[w])?T[w]:[T[w]];for(let E=0,y=I.length;E<y;E++){const L=I[E];if(p(L,w,E,P)===!0){const B=L.__offset,z=Array.isArray(L.value)?L.value:[L.value];let $=0;for(let Y=0;Y<z.length;Y++){const W=z[Y],j=_(W);typeof W=="number"||typeof W=="boolean"?(L.__data[0]=W,i.bufferSubData(i.UNIFORM_BUFFER,B+$,L.__data)):W.isMatrix3?(L.__data[0]=W.elements[0],L.__data[1]=W.elements[1],L.__data[2]=W.elements[2],L.__data[3]=0,L.__data[4]=W.elements[3],L.__data[5]=W.elements[4],L.__data[6]=W.elements[5],L.__data[7]=0,L.__data[8]=W.elements[6],L.__data[9]=W.elements[7],L.__data[10]=W.elements[8],L.__data[11]=0):(W.toArray(L.__data,$),$+=j.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,B,L.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function p(S,x,T,P){const w=S.value,A=x+"_"+T;if(P[A]===void 0)return typeof w=="number"||typeof w=="boolean"?P[A]=w:P[A]=w.clone(),!0;{const I=P[A];if(typeof w=="number"||typeof w=="boolean"){if(I!==w)return P[A]=w,!0}else if(I.equals(w)===!1)return I.copy(w),!0}return!1}function g(S){const x=S.uniforms;let T=0;const P=16;for(let A=0,I=x.length;A<I;A++){const E=Array.isArray(x[A])?x[A]:[x[A]];for(let y=0,L=E.length;y<L;y++){const B=E[y],z=Array.isArray(B.value)?B.value:[B.value];for(let $=0,Y=z.length;$<Y;$++){const W=z[$],j=_(W),X=T%P;X!==0&&P-X<j.boundary&&(T+=P-X),B.__data=new Float32Array(j.storage/Float32Array.BYTES_PER_ELEMENT),B.__offset=T,T+=j.storage}}}const w=T%P;return w>0&&(T+=P-w),S.__size=T,S.__cache={},this}function _(S){const x={boundary:0,storage:0};return typeof S=="number"||typeof S=="boolean"?(x.boundary=4,x.storage=4):S.isVector2?(x.boundary=8,x.storage=8):S.isVector3||S.isColor?(x.boundary=16,x.storage=12):S.isVector4?(x.boundary=16,x.storage=16):S.isMatrix3?(x.boundary=48,x.storage=48):S.isMatrix4?(x.boundary=64,x.storage=64):S.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",S),x}function m(S){const x=S.target;x.removeEventListener("dispose",m);const T=o.indexOf(x.__bindingPointIndex);o.splice(T,1),i.deleteBuffer(s[x.id]),delete s[x.id],delete r[x.id]}function f(){for(const S in s)i.deleteBuffer(s[S]);o=[],s={},r={}}return{bind:l,update:c,dispose:f}}class Sv{constructor(t={}){const{canvas:e=mf(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1}=t;this.isWebGLRenderer=!0;let d;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");d=n.getContextAttributes().alpha}else d=o;const p=new Uint32Array(4),g=new Int32Array(4);let _=null,m=null;const f=[],S=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=tn,this.toneMapping=Xn,this.toneMappingExposure=1;const x=this;let T=!1,P=0,w=0,A=null,I=-1,E=null;const y=new ue,L=new ue;let B=null;const z=new St(0);let $=0,Y=e.width,W=e.height,j=1,X=null,ht=null;const dt=new ue(0,0,Y,W),gt=new ue(0,0,Y,W);let Gt=!1;const Yt=new Ao;let q=!1,et=!1;const ft=new Jt,ot=new C,Ft={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Pt=!1;function Vt(){return A===null?j:1}let D=n;function Wt(b,U){return e.getContext(b,U)}try{const b={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${So}`),e.addEventListener("webglcontextlost",G,!1),e.addEventListener("webglcontextrestored",O,!1),e.addEventListener("webglcontextcreationerror",V,!1),D===null){const U="webgl2";if(D=Wt(U,b),D===null)throw Wt(U)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(b){throw console.error("THREE.WebGLRenderer: "+b.message),b}let Ht,ae,Et,Xt,Bt,Lt,he,R,M,H,K,J,Q,yt,rt,st,Dt,nt,vt,kt,wt,lt,It,Ut;function fe(){Ht=new Pg(D),Ht.init(),lt=new dv(D,Ht),ae=new Eg(D,Ht,t,lt),Et=new uv(D),Xt=new Ig(D),Bt=new K0,Lt=new hv(D,Ht,Et,Bt,ae,lt,Xt),he=new wg(x),R=new Rg(x),M=new kf(D),It=new Sg(D,M),H=new Lg(D,M,Xt,It),K=new Ng(D,H,M,Xt),vt=new Ug(D,ae,Lt),st=new Tg(Bt),J=new j0(x,he,R,Ht,ae,It,st),Q=new yv(x,Bt),yt=new J0,rt=new sv(Ht),nt=new Mg(x,he,R,Et,K,d,l),Dt=new cv(x,K,ae),Ut=new Mv(D,Xt,ae,Et),kt=new bg(D,Ht,Xt),wt=new Dg(D,Ht,Xt),Xt.programs=J.programs,x.capabilities=ae,x.extensions=Ht,x.properties=Bt,x.renderLists=yt,x.shadowMap=Dt,x.state=Et,x.info=Xt}fe();const v=new _v(x,D);this.xr=v,this.getContext=function(){return D},this.getContextAttributes=function(){return D.getContextAttributes()},this.forceContextLoss=function(){const b=Ht.get("WEBGL_lose_context");b&&b.loseContext()},this.forceContextRestore=function(){const b=Ht.get("WEBGL_lose_context");b&&b.restoreContext()},this.getPixelRatio=function(){return j},this.setPixelRatio=function(b){b!==void 0&&(j=b,this.setSize(Y,W,!1))},this.getSize=function(b){return b.set(Y,W)},this.setSize=function(b,U,F=!0){if(v.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}Y=b,W=U,e.width=Math.floor(b*j),e.height=Math.floor(U*j),F===!0&&(e.style.width=b+"px",e.style.height=U+"px"),this.setViewport(0,0,b,U)},this.getDrawingBufferSize=function(b){return b.set(Y*j,W*j).floor()},this.setDrawingBufferSize=function(b,U,F){Y=b,W=U,j=F,e.width=Math.floor(b*F),e.height=Math.floor(U*F),this.setViewport(0,0,b,U)},this.getCurrentViewport=function(b){return b.copy(y)},this.getViewport=function(b){return b.copy(dt)},this.setViewport=function(b,U,F,k){b.isVector4?dt.set(b.x,b.y,b.z,b.w):dt.set(b,U,F,k),Et.viewport(y.copy(dt).multiplyScalar(j).round())},this.getScissor=function(b){return b.copy(gt)},this.setScissor=function(b,U,F,k){b.isVector4?gt.set(b.x,b.y,b.z,b.w):gt.set(b,U,F,k),Et.scissor(L.copy(gt).multiplyScalar(j).round())},this.getScissorTest=function(){return Gt},this.setScissorTest=function(b){Et.setScissorTest(Gt=b)},this.setOpaqueSort=function(b){X=b},this.setTransparentSort=function(b){ht=b},this.getClearColor=function(b){return b.copy(nt.getClearColor())},this.setClearColor=function(){nt.setClearColor.apply(nt,arguments)},this.getClearAlpha=function(){return nt.getClearAlpha()},this.setClearAlpha=function(){nt.setClearAlpha.apply(nt,arguments)},this.clear=function(b=!0,U=!0,F=!0){let k=0;if(b){let N=!1;if(A!==null){const it=A.texture.format;N=it===mu||it===pu||it===fu}if(N){const it=A.texture.type,ut=it===jn||it===ss||it===Rr||it===rs||it===uu||it===hu,pt=nt.getClearColor(),_t=nt.getClearAlpha(),At=pt.r,Ct=pt.g,Tt=pt.b;ut?(p[0]=At,p[1]=Ct,p[2]=Tt,p[3]=_t,D.clearBufferuiv(D.COLOR,0,p)):(g[0]=At,g[1]=Ct,g[2]=Tt,g[3]=_t,D.clearBufferiv(D.COLOR,0,g))}else k|=D.COLOR_BUFFER_BIT}U&&(k|=D.DEPTH_BUFFER_BIT),F&&(k|=D.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),D.clear(k)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",G,!1),e.removeEventListener("webglcontextrestored",O,!1),e.removeEventListener("webglcontextcreationerror",V,!1),yt.dispose(),rt.dispose(),Bt.dispose(),he.dispose(),R.dispose(),K.dispose(),It.dispose(),Ut.dispose(),J.dispose(),v.dispose(),v.removeEventListener("sessionstart",xe),v.removeEventListener("sessionend",ye),Ge.stop()};function G(b){b.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),T=!0}function O(){console.log("THREE.WebGLRenderer: Context Restored."),T=!1;const b=Xt.autoReset,U=Dt.enabled,F=Dt.autoUpdate,k=Dt.needsUpdate,N=Dt.type;fe(),Xt.autoReset=b,Dt.enabled=U,Dt.autoUpdate=F,Dt.needsUpdate=k,Dt.type=N}function V(b){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",b.statusMessage)}function Z(b){const U=b.target;U.removeEventListener("dispose",Z),Mt(U)}function Mt(b){Rt(b),Bt.remove(b)}function Rt(b){const U=Bt.get(b).programs;U!==void 0&&(U.forEach(function(F){J.releaseProgram(F)}),b.isShaderMaterial&&J.releaseShaderCache(b))}this.renderBufferDirect=function(b,U,F,k,N,it){U===null&&(U=Ft);const ut=N.isMesh&&N.matrixWorld.determinant()<0,pt=Ku(b,U,F,k,N);Et.setMaterial(k,ut);let _t=F.index,At=1;if(k.wireframe===!0){if(_t=H.getWireframeAttribute(F),_t===void 0)return;At=2}const Ct=F.drawRange,Tt=F.attributes.position;let Qt=Ct.start*At,me=(Ct.start+Ct.count)*At;it!==null&&(Qt=Math.max(Qt,it.start*At),me=Math.min(me,(it.start+it.count)*At)),_t!==null?(Qt=Math.max(Qt,0),me=Math.min(me,_t.count)):Tt!=null&&(Qt=Math.max(Qt,0),me=Math.min(me,Tt.count));const ge=me-Qt;if(ge<0||ge===1/0)return;It.setup(N,k,pt,F,_t);let We,ee=kt;if(_t!==null&&(We=M.get(_t),ee=wt,ee.setIndex(We)),N.isMesh)k.wireframe===!0?(Et.setLineWidth(k.wireframeLinewidth*Vt()),ee.setMode(D.LINES)):ee.setMode(D.TRIANGLES);else if(N.isLine){let bt=k.linewidth;bt===void 0&&(bt=1),Et.setLineWidth(bt*Vt()),N.isLineSegments?ee.setMode(D.LINES):N.isLineLoop?ee.setMode(D.LINE_LOOP):ee.setMode(D.LINE_STRIP)}else N.isPoints?ee.setMode(D.POINTS):N.isSprite&&ee.setMode(D.TRIANGLES);if(N.isBatchedMesh)N._multiDrawInstances!==null?ee.renderMultiDrawInstances(N._multiDrawStarts,N._multiDrawCounts,N._multiDrawCount,N._multiDrawInstances):ee.renderMultiDraw(N._multiDrawStarts,N._multiDrawCounts,N._multiDrawCount);else if(N.isInstancedMesh)ee.renderInstances(Qt,ge,N.count);else if(F.isInstancedBufferGeometry){const bt=F._maxInstanceCount!==void 0?F._maxInstanceCount:1/0,Oe=Math.min(F.instanceCount,bt);ee.renderInstances(Qt,ge,Oe)}else ee.render(Qt,ge)};function pe(b,U,F){b.transparent===!0&&b.side===je&&b.forceSinglePass===!1?(b.side=Ue,b.needsUpdate=!0,Fs(b,U,F),b.side=Yn,b.needsUpdate=!0,Fs(b,U,F),b.side=je):Fs(b,U,F)}this.compile=function(b,U,F=null){F===null&&(F=b),m=rt.get(F),m.init(U),S.push(m),F.traverseVisible(function(N){N.isLight&&N.layers.test(U.layers)&&(m.pushLight(N),N.castShadow&&m.pushShadow(N))}),b!==F&&b.traverseVisible(function(N){N.isLight&&N.layers.test(U.layers)&&(m.pushLight(N),N.castShadow&&m.pushShadow(N))}),m.setupLights();const k=new Set;return b.traverse(function(N){const it=N.material;if(it)if(Array.isArray(it))for(let ut=0;ut<it.length;ut++){const pt=it[ut];pe(pt,F,N),k.add(pt)}else pe(it,F,N),k.add(it)}),S.pop(),m=null,k},this.compileAsync=function(b,U,F=null){const k=this.compile(b,U,F);return new Promise(N=>{function it(){if(k.forEach(function(ut){Bt.get(ut).currentProgram.isReady()&&k.delete(ut)}),k.size===0){N(b);return}setTimeout(it,10)}Ht.get("KHR_parallel_shader_compile")!==null?it():setTimeout(it,10)})};let _e=null;function jt(b){_e&&_e(b)}function xe(){Ge.stop()}function ye(){Ge.start()}const Ge=new Au;Ge.setAnimationLoop(jt),typeof self<"u"&&Ge.setContext(self),this.setAnimationLoop=function(b){_e=b,v.setAnimationLoop(b),b===null?Ge.stop():Ge.start()},v.addEventListener("sessionstart",xe),v.addEventListener("sessionend",ye),this.render=function(b,U){if(U!==void 0&&U.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(T===!0)return;if(b.matrixWorldAutoUpdate===!0&&b.updateMatrixWorld(),U.parent===null&&U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),v.enabled===!0&&v.isPresenting===!0&&(v.cameraAutoUpdate===!0&&v.updateCamera(U),U=v.getCamera()),b.isScene===!0&&b.onBeforeRender(x,b,U,A),m=rt.get(b,S.length),m.init(U),S.push(m),ft.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),Yt.setFromProjectionMatrix(ft),et=this.localClippingEnabled,q=st.init(this.clippingPlanes,et),_=yt.get(b,f.length),_.init(),f.push(_),v.enabled===!0&&v.isPresenting===!0){const it=x.xr.getDepthSensingMesh();it!==null&&Ve(it,U,-1/0,x.sortObjects)}Ve(b,U,0,x.sortObjects),_.finish(),x.sortObjects===!0&&_.sort(X,ht),Pt=v.enabled===!1||v.isPresenting===!1||v.hasDepthSensing()===!1,Pt&&nt.addToRenderList(_,b),this.info.render.frame++,q===!0&&st.beginShadows();const F=m.state.shadowsArray;Dt.render(F,b,U),q===!0&&st.endShadows(),this.info.autoReset===!0&&this.info.reset();const k=_.opaque,N=_.transmissive;if(m.setupLights(),U.isArrayCamera){const it=U.cameras;if(N.length>0)for(let ut=0,pt=it.length;ut<pt;ut++){const _t=it[ut];Jn(k,N,b,_t)}Pt&&nt.render(b);for(let ut=0,pt=it.length;ut<pt;ut++){const _t=it[ut];Un(_,b,_t,_t.viewport)}}else N.length>0&&Jn(k,N,b,U),Pt&&nt.render(b),Un(_,b,U);A!==null&&(Lt.updateMultisampleRenderTarget(A),Lt.updateRenderTargetMipmap(A)),b.isScene===!0&&b.onAfterRender(x,b,U),It.resetDefaultState(),I=-1,E=null,S.pop(),S.length>0?(m=S[S.length-1],q===!0&&st.setGlobalState(x.clippingPlanes,m.state.camera)):m=null,f.pop(),f.length>0?_=f[f.length-1]:_=null};function Ve(b,U,F,k){if(b.visible===!1)return;if(b.layers.test(U.layers)){if(b.isGroup)F=b.renderOrder;else if(b.isLOD)b.autoUpdate===!0&&b.update(U);else if(b.isLight)m.pushLight(b),b.castShadow&&m.pushShadow(b);else if(b.isSprite){if(!b.frustumCulled||Yt.intersectsSprite(b)){k&&ot.setFromMatrixPosition(b.matrixWorld).applyMatrix4(ft);const ut=K.update(b),pt=b.material;pt.visible&&_.push(b,ut,pt,F,ot.z,null)}}else if((b.isMesh||b.isLine||b.isPoints)&&(!b.frustumCulled||Yt.intersectsObject(b))){const ut=K.update(b),pt=b.material;if(k&&(b.boundingSphere!==void 0?(b.boundingSphere===null&&b.computeBoundingSphere(),ot.copy(b.boundingSphere.center)):(ut.boundingSphere===null&&ut.computeBoundingSphere(),ot.copy(ut.boundingSphere.center)),ot.applyMatrix4(b.matrixWorld).applyMatrix4(ft)),Array.isArray(pt)){const _t=ut.groups;for(let At=0,Ct=_t.length;At<Ct;At++){const Tt=_t[At],Qt=pt[Tt.materialIndex];Qt&&Qt.visible&&_.push(b,ut,Qt,F,ot.z,Tt)}}else pt.visible&&_.push(b,ut,pt,F,ot.z,null)}}const it=b.children;for(let ut=0,pt=it.length;ut<pt;ut++)Ve(it[ut],U,F,k)}function Un(b,U,F,k){const N=b.opaque,it=b.transmissive,ut=b.transparent;m.setupLightsView(F),q===!0&&st.setGlobalState(x.clippingPlanes,F),k&&Et.viewport(y.copy(k)),N.length>0&&Qn(N,U,F),it.length>0&&Qn(it,U,F),ut.length>0&&Qn(ut,U,F),Et.buffers.depth.setTest(!0),Et.buffers.depth.setMask(!0),Et.buffers.color.setMask(!0),Et.setPolygonOffset(!1)}function Jn(b,U,F,k){if((F.isScene===!0?F.overrideMaterial:null)!==null)return;m.state.transmissionRenderTarget[k.id]===void 0&&(m.state.transmissionRenderTarget[k.id]=new dn(1,1,{generateMipmaps:!0,type:Ht.has("EXT_color_buffer_half_float")||Ht.has("EXT_color_buffer_float")?$n:jn,minFilter:hi,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:te.workingColorSpace}));const it=m.state.transmissionRenderTarget[k.id],ut=k.viewport||y;it.setSize(ut.z,ut.w);const pt=x.getRenderTarget();x.setRenderTarget(it),x.getClearColor(z),$=x.getClearAlpha(),$<1&&x.setClearColor(16777215,.5),Pt?nt.render(F):x.clear();const _t=x.toneMapping;x.toneMapping=Xn;const At=k.viewport;if(k.viewport!==void 0&&(k.viewport=void 0),m.setupLightsView(k),q===!0&&st.setGlobalState(x.clippingPlanes,k),Qn(b,F,k),Lt.updateMultisampleRenderTarget(it),Lt.updateRenderTargetMipmap(it),Ht.has("WEBGL_multisampled_render_to_texture")===!1){let Ct=!1;for(let Tt=0,Qt=U.length;Tt<Qt;Tt++){const me=U[Tt],ge=me.object,We=me.geometry,ee=me.material,bt=me.group;if(ee.side===je&&ge.layers.test(k.layers)){const Oe=ee.side;ee.side=Ue,ee.needsUpdate=!0,zo(ge,F,k,We,ee,bt),ee.side=Oe,ee.needsUpdate=!0,Ct=!0}}Ct===!0&&(Lt.updateMultisampleRenderTarget(it),Lt.updateRenderTargetMipmap(it))}x.setRenderTarget(pt),x.setClearColor(z,$),At!==void 0&&(k.viewport=At),x.toneMapping=_t}function Qn(b,U,F){const k=U.isScene===!0?U.overrideMaterial:null;for(let N=0,it=b.length;N<it;N++){const ut=b[N],pt=ut.object,_t=ut.geometry,At=k===null?ut.material:k,Ct=ut.group;pt.layers.test(F.layers)&&zo(pt,U,F,_t,At,Ct)}}function zo(b,U,F,k,N,it){b.onBeforeRender(x,U,F,k,N,it),b.modelViewMatrix.multiplyMatrices(F.matrixWorldInverse,b.matrixWorld),b.normalMatrix.getNormalMatrix(b.modelViewMatrix),N.onBeforeRender(x,U,F,k,b,it),N.transparent===!0&&N.side===je&&N.forceSinglePass===!1?(N.side=Ue,N.needsUpdate=!0,x.renderBufferDirect(F,U,k,N,b,it),N.side=Yn,N.needsUpdate=!0,x.renderBufferDirect(F,U,k,N,b,it),N.side=je):x.renderBufferDirect(F,U,k,N,b,it),b.onAfterRender(x,U,F,k,N,it)}function Fs(b,U,F){U.isScene!==!0&&(U=Ft);const k=Bt.get(b),N=m.state.lights,it=m.state.shadowsArray,ut=N.state.version,pt=J.getParameters(b,N.state,it,U,F),_t=J.getProgramCacheKey(pt);let At=k.programs;k.environment=b.isMeshStandardMaterial?U.environment:null,k.fog=U.fog,k.envMap=(b.isMeshStandardMaterial?R:he).get(b.envMap||k.environment),k.envMapRotation=k.environment!==null&&b.envMap===null?U.environmentRotation:b.envMapRotation,At===void 0&&(b.addEventListener("dispose",Z),At=new Map,k.programs=At);let Ct=At.get(_t);if(Ct!==void 0){if(k.currentProgram===Ct&&k.lightsStateVersion===ut)return Ho(b,pt),Ct}else pt.uniforms=J.getUniforms(b),b.onBuild(F,pt,x),b.onBeforeCompile(pt,x),Ct=J.acquireProgram(pt,_t),At.set(_t,Ct),k.uniforms=pt.uniforms;const Tt=k.uniforms;return(!b.isShaderMaterial&&!b.isRawShaderMaterial||b.clipping===!0)&&(Tt.clippingPlanes=st.uniform),Ho(b,pt),k.needsLights=Ju(b),k.lightsStateVersion=ut,k.needsLights&&(Tt.ambientLightColor.value=N.state.ambient,Tt.lightProbe.value=N.state.probe,Tt.directionalLights.value=N.state.directional,Tt.directionalLightShadows.value=N.state.directionalShadow,Tt.spotLights.value=N.state.spot,Tt.spotLightShadows.value=N.state.spotShadow,Tt.rectAreaLights.value=N.state.rectArea,Tt.ltc_1.value=N.state.rectAreaLTC1,Tt.ltc_2.value=N.state.rectAreaLTC2,Tt.pointLights.value=N.state.point,Tt.pointLightShadows.value=N.state.pointShadow,Tt.hemisphereLights.value=N.state.hemi,Tt.directionalShadowMap.value=N.state.directionalShadowMap,Tt.directionalShadowMatrix.value=N.state.directionalShadowMatrix,Tt.spotShadowMap.value=N.state.spotShadowMap,Tt.spotLightMatrix.value=N.state.spotLightMatrix,Tt.spotLightMap.value=N.state.spotLightMap,Tt.pointShadowMap.value=N.state.pointShadowMap,Tt.pointShadowMatrix.value=N.state.pointShadowMatrix),k.currentProgram=Ct,k.uniformsList=null,Ct}function ko(b){if(b.uniformsList===null){const U=b.currentProgram.getUniforms();b.uniformsList=Tr.seqWithValue(U.seq,b.uniforms)}return b.uniformsList}function Ho(b,U){const F=Bt.get(b);F.outputColorSpace=U.outputColorSpace,F.batching=U.batching,F.batchingColor=U.batchingColor,F.instancing=U.instancing,F.instancingColor=U.instancingColor,F.instancingMorph=U.instancingMorph,F.skinning=U.skinning,F.morphTargets=U.morphTargets,F.morphNormals=U.morphNormals,F.morphColors=U.morphColors,F.morphTargetsCount=U.morphTargetsCount,F.numClippingPlanes=U.numClippingPlanes,F.numIntersection=U.numClipIntersection,F.vertexAlphas=U.vertexAlphas,F.vertexTangents=U.vertexTangents,F.toneMapping=U.toneMapping}function Ku(b,U,F,k,N){U.isScene!==!0&&(U=Ft),Lt.resetTextureUnits();const it=U.fog,ut=k.isMeshStandardMaterial?U.environment:null,pt=A===null?x.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:Kn,_t=(k.isMeshStandardMaterial?R:he).get(k.envMap||ut),At=k.vertexColors===!0&&!!F.attributes.color&&F.attributes.color.itemSize===4,Ct=!!F.attributes.tangent&&(!!k.normalMap||k.anisotropy>0),Tt=!!F.morphAttributes.position,Qt=!!F.morphAttributes.normal,me=!!F.morphAttributes.color;let ge=Xn;k.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(ge=x.toneMapping);const We=F.morphAttributes.position||F.morphAttributes.normal||F.morphAttributes.color,ee=We!==void 0?We.length:0,bt=Bt.get(k),Oe=m.state.lights;if(q===!0&&(et===!0||b!==E)){const Ke=b===E&&k.id===I;st.setState(k,b,Ke)}let ie=!1;k.version===bt.__version?(bt.needsLights&&bt.lightsStateVersion!==Oe.state.version||bt.outputColorSpace!==pt||N.isBatchedMesh&&bt.batching===!1||!N.isBatchedMesh&&bt.batching===!0||N.isBatchedMesh&&bt.batchingColor===!0&&N.colorTexture===null||N.isBatchedMesh&&bt.batchingColor===!1&&N.colorTexture!==null||N.isInstancedMesh&&bt.instancing===!1||!N.isInstancedMesh&&bt.instancing===!0||N.isSkinnedMesh&&bt.skinning===!1||!N.isSkinnedMesh&&bt.skinning===!0||N.isInstancedMesh&&bt.instancingColor===!0&&N.instanceColor===null||N.isInstancedMesh&&bt.instancingColor===!1&&N.instanceColor!==null||N.isInstancedMesh&&bt.instancingMorph===!0&&N.morphTexture===null||N.isInstancedMesh&&bt.instancingMorph===!1&&N.morphTexture!==null||bt.envMap!==_t||k.fog===!0&&bt.fog!==it||bt.numClippingPlanes!==void 0&&(bt.numClippingPlanes!==st.numPlanes||bt.numIntersection!==st.numIntersection)||bt.vertexAlphas!==At||bt.vertexTangents!==Ct||bt.morphTargets!==Tt||bt.morphNormals!==Qt||bt.morphColors!==me||bt.toneMapping!==ge||bt.morphTargetsCount!==ee)&&(ie=!0):(ie=!0,bt.__version=k.version);let Sn=bt.currentProgram;ie===!0&&(Sn=Fs(k,U,N));let Bs=!1,ti=!1,jr=!1;const Ee=Sn.getUniforms(),Nn=bt.uniforms;if(Et.useProgram(Sn.program)&&(Bs=!0,ti=!0,jr=!0),k.id!==I&&(I=k.id,ti=!0),Bs||E!==b){Ee.setValue(D,"projectionMatrix",b.projectionMatrix),Ee.setValue(D,"viewMatrix",b.matrixWorldInverse);const Ke=Ee.map.cameraPosition;Ke!==void 0&&Ke.setValue(D,ot.setFromMatrixPosition(b.matrixWorld)),ae.logarithmicDepthBuffer&&Ee.setValue(D,"logDepthBufFC",2/(Math.log(b.far+1)/Math.LN2)),(k.isMeshPhongMaterial||k.isMeshToonMaterial||k.isMeshLambertMaterial||k.isMeshBasicMaterial||k.isMeshStandardMaterial||k.isShaderMaterial)&&Ee.setValue(D,"isOrthographic",b.isOrthographicCamera===!0),E!==b&&(E=b,ti=!0,jr=!0)}if(N.isSkinnedMesh){Ee.setOptional(D,N,"bindMatrix"),Ee.setOptional(D,N,"bindMatrixInverse");const Ke=N.skeleton;Ke&&(Ke.boneTexture===null&&Ke.computeBoneTexture(),Ee.setValue(D,"boneTexture",Ke.boneTexture,Lt))}N.isBatchedMesh&&(Ee.setOptional(D,N,"batchingTexture"),Ee.setValue(D,"batchingTexture",N._matricesTexture,Lt),Ee.setOptional(D,N,"batchingColorTexture"),N._colorsTexture!==null&&Ee.setValue(D,"batchingColorTexture",N._colorsTexture,Lt));const Kr=F.morphAttributes;if((Kr.position!==void 0||Kr.normal!==void 0||Kr.color!==void 0)&&vt.update(N,F,Sn),(ti||bt.receiveShadow!==N.receiveShadow)&&(bt.receiveShadow=N.receiveShadow,Ee.setValue(D,"receiveShadow",N.receiveShadow)),k.isMeshGouraudMaterial&&k.envMap!==null&&(Nn.envMap.value=_t,Nn.flipEnvMap.value=_t.isCubeTexture&&_t.isRenderTargetTexture===!1?-1:1),k.isMeshStandardMaterial&&k.envMap===null&&U.environment!==null&&(Nn.envMapIntensity.value=U.environmentIntensity),ti&&(Ee.setValue(D,"toneMappingExposure",x.toneMappingExposure),bt.needsLights&&Zu(Nn,jr),it&&k.fog===!0&&Q.refreshFogUniforms(Nn,it),Q.refreshMaterialUniforms(Nn,k,j,W,m.state.transmissionRenderTarget[b.id]),Tr.upload(D,ko(bt),Nn,Lt)),k.isShaderMaterial&&k.uniformsNeedUpdate===!0&&(Tr.upload(D,ko(bt),Nn,Lt),k.uniformsNeedUpdate=!1),k.isSpriteMaterial&&Ee.setValue(D,"center",N.center),Ee.setValue(D,"modelViewMatrix",N.modelViewMatrix),Ee.setValue(D,"normalMatrix",N.normalMatrix),Ee.setValue(D,"modelMatrix",N.matrixWorld),k.isShaderMaterial||k.isRawShaderMaterial){const Ke=k.uniformsGroups;for(let Zr=0,Qu=Ke.length;Zr<Qu;Zr++){const Go=Ke[Zr];Ut.update(Go,Sn),Ut.bind(Go,Sn)}}return Sn}function Zu(b,U){b.ambientLightColor.needsUpdate=U,b.lightProbe.needsUpdate=U,b.directionalLights.needsUpdate=U,b.directionalLightShadows.needsUpdate=U,b.pointLights.needsUpdate=U,b.pointLightShadows.needsUpdate=U,b.spotLights.needsUpdate=U,b.spotLightShadows.needsUpdate=U,b.rectAreaLights.needsUpdate=U,b.hemisphereLights.needsUpdate=U}function Ju(b){return b.isMeshLambertMaterial||b.isMeshToonMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isShadowMaterial||b.isShaderMaterial&&b.lights===!0}this.getActiveCubeFace=function(){return P},this.getActiveMipmapLevel=function(){return w},this.getRenderTarget=function(){return A},this.setRenderTargetTextures=function(b,U,F){Bt.get(b.texture).__webglTexture=U,Bt.get(b.depthTexture).__webglTexture=F;const k=Bt.get(b);k.__hasExternalTextures=!0,k.__autoAllocateDepthBuffer=F===void 0,k.__autoAllocateDepthBuffer||Ht.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),k.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(b,U){const F=Bt.get(b);F.__webglFramebuffer=U,F.__useDefaultFramebuffer=U===void 0},this.setRenderTarget=function(b,U=0,F=0){A=b,P=U,w=F;let k=!0,N=null,it=!1,ut=!1;if(b){const _t=Bt.get(b);_t.__useDefaultFramebuffer!==void 0?(Et.bindFramebuffer(D.FRAMEBUFFER,null),k=!1):_t.__webglFramebuffer===void 0?Lt.setupRenderTarget(b):_t.__hasExternalTextures&&Lt.rebindTextures(b,Bt.get(b.texture).__webglTexture,Bt.get(b.depthTexture).__webglTexture);const At=b.texture;(At.isData3DTexture||At.isDataArrayTexture||At.isCompressedArrayTexture)&&(ut=!0);const Ct=Bt.get(b).__webglFramebuffer;b.isWebGLCubeRenderTarget?(Array.isArray(Ct[U])?N=Ct[U][F]:N=Ct[U],it=!0):b.samples>0&&Lt.useMultisampledRTT(b)===!1?N=Bt.get(b).__webglMultisampledFramebuffer:Array.isArray(Ct)?N=Ct[F]:N=Ct,y.copy(b.viewport),L.copy(b.scissor),B=b.scissorTest}else y.copy(dt).multiplyScalar(j).floor(),L.copy(gt).multiplyScalar(j).floor(),B=Gt;if(Et.bindFramebuffer(D.FRAMEBUFFER,N)&&k&&Et.drawBuffers(b,N),Et.viewport(y),Et.scissor(L),Et.setScissorTest(B),it){const _t=Bt.get(b.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_CUBE_MAP_POSITIVE_X+U,_t.__webglTexture,F)}else if(ut){const _t=Bt.get(b.texture),At=U||0;D.framebufferTextureLayer(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,_t.__webglTexture,F||0,At)}I=-1},this.readRenderTargetPixels=function(b,U,F,k,N,it,ut){if(!(b&&b.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let pt=Bt.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&ut!==void 0&&(pt=pt[ut]),pt){Et.bindFramebuffer(D.FRAMEBUFFER,pt);try{const _t=b.texture,At=_t.format,Ct=_t.type;if(!ae.textureFormatReadable(At)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!ae.textureTypeReadable(Ct)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}U>=0&&U<=b.width-k&&F>=0&&F<=b.height-N&&D.readPixels(U,F,k,N,lt.convert(At),lt.convert(Ct),it)}finally{const _t=A!==null?Bt.get(A).__webglFramebuffer:null;Et.bindFramebuffer(D.FRAMEBUFFER,_t)}}},this.readRenderTargetPixelsAsync=async function(b,U,F,k,N,it,ut){if(!(b&&b.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let pt=Bt.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&ut!==void 0&&(pt=pt[ut]),pt){Et.bindFramebuffer(D.FRAMEBUFFER,pt);try{const _t=b.texture,At=_t.format,Ct=_t.type;if(!ae.textureFormatReadable(At))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!ae.textureTypeReadable(Ct))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(U>=0&&U<=b.width-k&&F>=0&&F<=b.height-N){const Tt=D.createBuffer();D.bindBuffer(D.PIXEL_PACK_BUFFER,Tt),D.bufferData(D.PIXEL_PACK_BUFFER,it.byteLength,D.STREAM_READ),D.readPixels(U,F,k,N,lt.convert(At),lt.convert(Ct),0),D.flush();const Qt=D.fenceSync(D.SYNC_GPU_COMMANDS_COMPLETE,0);await gf(D,Qt,4);try{D.bindBuffer(D.PIXEL_PACK_BUFFER,Tt),D.getBufferSubData(D.PIXEL_PACK_BUFFER,0,it)}finally{D.deleteBuffer(Tt),D.deleteSync(Qt)}return it}}finally{const _t=A!==null?Bt.get(A).__webglFramebuffer:null;Et.bindFramebuffer(D.FRAMEBUFFER,_t)}}},this.copyFramebufferToTexture=function(b,U=null,F=0){b.isTexture!==!0&&(console.warn("WebGLRenderer: copyFramebufferToTexture function signature has changed."),U=arguments[0]||null,b=arguments[1]);const k=Math.pow(2,-F),N=Math.floor(b.image.width*k),it=Math.floor(b.image.height*k),ut=U!==null?U.x:0,pt=U!==null?U.y:0;Lt.setTexture2D(b,0),D.copyTexSubImage2D(D.TEXTURE_2D,F,0,0,ut,pt,N,it),Et.unbindTexture()},this.copyTextureToTexture=function(b,U,F=null,k=null,N=0){b.isTexture!==!0&&(console.warn("WebGLRenderer: copyTextureToTexture function signature has changed."),k=arguments[0]||null,b=arguments[1],U=arguments[2],N=arguments[3]||0,F=null);let it,ut,pt,_t,At,Ct;F!==null?(it=F.max.x-F.min.x,ut=F.max.y-F.min.y,pt=F.min.x,_t=F.min.y):(it=b.image.width,ut=b.image.height,pt=0,_t=0),k!==null?(At=k.x,Ct=k.y):(At=0,Ct=0);const Tt=lt.convert(U.format),Qt=lt.convert(U.type);Lt.setTexture2D(U,0),D.pixelStorei(D.UNPACK_FLIP_Y_WEBGL,U.flipY),D.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),D.pixelStorei(D.UNPACK_ALIGNMENT,U.unpackAlignment);const me=D.getParameter(D.UNPACK_ROW_LENGTH),ge=D.getParameter(D.UNPACK_IMAGE_HEIGHT),We=D.getParameter(D.UNPACK_SKIP_PIXELS),ee=D.getParameter(D.UNPACK_SKIP_ROWS),bt=D.getParameter(D.UNPACK_SKIP_IMAGES),Oe=b.isCompressedTexture?b.mipmaps[N]:b.image;D.pixelStorei(D.UNPACK_ROW_LENGTH,Oe.width),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,Oe.height),D.pixelStorei(D.UNPACK_SKIP_PIXELS,pt),D.pixelStorei(D.UNPACK_SKIP_ROWS,_t),b.isDataTexture?D.texSubImage2D(D.TEXTURE_2D,N,At,Ct,it,ut,Tt,Qt,Oe.data):b.isCompressedTexture?D.compressedTexSubImage2D(D.TEXTURE_2D,N,At,Ct,Oe.width,Oe.height,Tt,Oe.data):D.texSubImage2D(D.TEXTURE_2D,N,At,Ct,Tt,Qt,Oe),D.pixelStorei(D.UNPACK_ROW_LENGTH,me),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,ge),D.pixelStorei(D.UNPACK_SKIP_PIXELS,We),D.pixelStorei(D.UNPACK_SKIP_ROWS,ee),D.pixelStorei(D.UNPACK_SKIP_IMAGES,bt),N===0&&U.generateMipmaps&&D.generateMipmap(D.TEXTURE_2D),Et.unbindTexture()},this.copyTextureToTexture3D=function(b,U,F=null,k=null,N=0){b.isTexture!==!0&&(console.warn("WebGLRenderer: copyTextureToTexture3D function signature has changed."),F=arguments[0]||null,k=arguments[1]||null,b=arguments[2],U=arguments[3],N=arguments[4]||0);let it,ut,pt,_t,At,Ct,Tt,Qt,me;const ge=b.isCompressedTexture?b.mipmaps[N]:b.image;F!==null?(it=F.max.x-F.min.x,ut=F.max.y-F.min.y,pt=F.max.z-F.min.z,_t=F.min.x,At=F.min.y,Ct=F.min.z):(it=ge.width,ut=ge.height,pt=ge.depth,_t=0,At=0,Ct=0),k!==null?(Tt=k.x,Qt=k.y,me=k.z):(Tt=0,Qt=0,me=0);const We=lt.convert(U.format),ee=lt.convert(U.type);let bt;if(U.isData3DTexture)Lt.setTexture3D(U,0),bt=D.TEXTURE_3D;else if(U.isDataArrayTexture||U.isCompressedArrayTexture)Lt.setTexture2DArray(U,0),bt=D.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}D.pixelStorei(D.UNPACK_FLIP_Y_WEBGL,U.flipY),D.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),D.pixelStorei(D.UNPACK_ALIGNMENT,U.unpackAlignment);const Oe=D.getParameter(D.UNPACK_ROW_LENGTH),ie=D.getParameter(D.UNPACK_IMAGE_HEIGHT),Sn=D.getParameter(D.UNPACK_SKIP_PIXELS),Bs=D.getParameter(D.UNPACK_SKIP_ROWS),ti=D.getParameter(D.UNPACK_SKIP_IMAGES);D.pixelStorei(D.UNPACK_ROW_LENGTH,ge.width),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,ge.height),D.pixelStorei(D.UNPACK_SKIP_PIXELS,_t),D.pixelStorei(D.UNPACK_SKIP_ROWS,At),D.pixelStorei(D.UNPACK_SKIP_IMAGES,Ct),b.isDataTexture||b.isData3DTexture?D.texSubImage3D(bt,N,Tt,Qt,me,it,ut,pt,We,ee,ge.data):U.isCompressedArrayTexture?D.compressedTexSubImage3D(bt,N,Tt,Qt,me,it,ut,pt,We,ge.data):D.texSubImage3D(bt,N,Tt,Qt,me,it,ut,pt,We,ee,ge),D.pixelStorei(D.UNPACK_ROW_LENGTH,Oe),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,ie),D.pixelStorei(D.UNPACK_SKIP_PIXELS,Sn),D.pixelStorei(D.UNPACK_SKIP_ROWS,Bs),D.pixelStorei(D.UNPACK_SKIP_IMAGES,ti),N===0&&U.generateMipmaps&&D.generateMipmap(bt),Et.unbindTexture()},this.initRenderTarget=function(b){Bt.get(b).__webglFramebuffer===void 0&&Lt.setupRenderTarget(b)},this.initTexture=function(b){b.isCubeTexture?Lt.setTextureCube(b,0):b.isData3DTexture?Lt.setTexture3D(b,0):b.isDataArrayTexture||b.isCompressedArrayTexture?Lt.setTexture2DArray(b,0):Lt.setTexture2D(b,0),Et.unbindTexture()},this.resetState=function(){P=0,w=0,A=null,Et.reset(),It.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Ln}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const e=this.getContext();e.drawingBufferColorSpace=t===Eo?"display-p3":"srgb",e.unpackColorSpace=te.workingColorSpace===Wr?"display-p3":"srgb"}}class qr{constructor(t,e=25e-5){this.isFogExp2=!0,this.name="",this.color=new St(t),this.density=e}clone(){return new qr(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}}class bv extends ce{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Mn,this.environmentIntensity=1,this.environmentRotation=new Mn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}}class Ev{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=oo,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.version=0,this.uuid=qn()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}get updateRange(){return To("THREE.InterleavedBuffer: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,n){t*=this.stride,n*=e.stride;for(let s=0,r=this.stride;s<r;s++)this.array[t+s]=e.array[n+s];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=qn()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const e=new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(e,this.stride);return n.setUsage(this.usage),n}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){return t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=qn()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const Fe=new C;class Nr{constructor(t,e,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,n=this.data.count;e<n;e++)Fe.fromBufferAttribute(this,e),Fe.applyMatrix4(t),this.setXYZ(e,Fe.x,Fe.y,Fe.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Fe.fromBufferAttribute(this,e),Fe.applyNormalMatrix(t),this.setXYZ(e,Fe.x,Fe.y,Fe.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Fe.fromBufferAttribute(this,e),Fe.transformDirection(t),this.setXYZ(e,Fe.x,Fe.y,Fe.z);return this}getComponent(t,e){let n=this.array[t*this.data.stride+this.offset+e];return this.normalized&&(n=xn(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=se(n,this.array)),this.data.array[t*this.data.stride+this.offset+e]=n,this}setX(t,e){return this.normalized&&(e=se(e,this.array)),this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){return this.normalized&&(e=se(e,this.array)),this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){return this.normalized&&(e=se(e,this.array)),this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){return this.normalized&&(e=se(e,this.array)),this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(e=xn(e,this.array)),e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(e=xn(e,this.array)),e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(e=xn(e,this.array)),e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(e=xn(e,this.array)),e}setXY(t,e,n){return t=t*this.data.stride+this.offset,this.normalized&&(e=se(e,this.array),n=se(n,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this}setXYZ(t,e,n,s){return t=t*this.data.stride+this.offset,this.normalized&&(e=se(e,this.array),n=se(n,this.array),s=se(s,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t=t*this.data.stride+this.offset,this.normalized&&(e=se(e,this.array),n=se(n,this.array),s=se(s,this.array),r=se(r,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=s,this.data.array[t+3]=r,this}clone(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const e=[];for(let n=0;n<this.count;n++){const s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return new Pe(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new Nr(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const e=[];for(let n=0;n<this.count;n++){const s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class uo extends Zn{constructor(t){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new St(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.rotation=t.rotation,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}let ki;const ms=new C,Hi=new C,Gi=new C,Vi=new tt,gs=new tt,Uu=new Jt,cr=new C,vs=new C,ur=new C,mc=new tt,Na=new tt,gc=new tt;class vc extends ce{constructor(t=new uo){if(super(),this.isSprite=!0,this.type="Sprite",ki===void 0){ki=new qt;const e=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new Ev(e,5);ki.setIndex([0,1,2,0,2,3]),ki.setAttribute("position",new Nr(n,3,0,!1)),ki.setAttribute("uv",new Nr(n,2,3,!1))}this.geometry=ki,this.material=t,this.center=new tt(.5,.5)}raycast(t,e){t.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Hi.setFromMatrixScale(this.matrixWorld),Uu.copy(t.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse,this.matrixWorld),Gi.setFromMatrixPosition(this.modelViewMatrix),t.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Hi.multiplyScalar(-Gi.z);const n=this.material.rotation;let s,r;n!==0&&(r=Math.cos(n),s=Math.sin(n));const o=this.center;hr(cr.set(-.5,-.5,0),Gi,o,Hi,s,r),hr(vs.set(.5,-.5,0),Gi,o,Hi,s,r),hr(ur.set(.5,.5,0),Gi,o,Hi,s,r),mc.set(0,0),Na.set(1,0),gc.set(1,1);let a=t.ray.intersectTriangle(cr,vs,ur,!1,ms);if(a===null&&(hr(vs.set(-.5,.5,0),Gi,o,Hi,s,r),Na.set(0,1),a=t.ray.intersectTriangle(cr,ur,vs,!1,ms),a===null))return;const l=t.ray.origin.distanceTo(ms);l<t.near||l>t.far||e.push({distance:l,point:ms.clone(),uv:hn.getInterpolation(ms,cr,vs,ur,mc,Na,gc,new tt),face:null,object:this})}copy(t,e){return super.copy(t,e),t.center!==void 0&&this.center.copy(t.center),this.material=t.material,this}}function hr(i,t,e,n,s,r){Vi.subVectors(i,e).addScalar(.5).multiply(n),s!==void 0?(gs.x=r*Vi.x-s*Vi.y,gs.y=s*Vi.x+r*Vi.y):gs.copy(Vi),i.copy(t),i.x+=gs.x,i.y+=gs.y,i.applyMatrix4(Uu)}class Tv extends Ne{constructor(t=null,e=1,n=1,s,r,o,a,l,c=He,u=He,h,d){super(null,o,a,l,c,u,s,r,h,d),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class _c extends Pe{constructor(t,e,n,s=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){const t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}}const Wi=new Jt,xc=new Jt,dr=[],yc=new xi,wv=new Jt,_s=new xt,xs=new yi;class cn extends xt{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new _c(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,wv)}computeBoundingBox(){const t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new xi),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Wi),yc.copy(t.boundingBox).applyMatrix4(Wi),this.boundingBox.union(yc)}computeBoundingSphere(){const t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new yi),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Wi),xs.copy(t.boundingSphere).applyMatrix4(Wi),this.boundingSphere.union(xs)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){const n=e.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,o=t*r+1;for(let a=0;a<n.length;a++)n[a]=s[o+a]}raycast(t,e){const n=this.matrixWorld,s=this.count;if(_s.geometry=this.geometry,_s.material=this.material,_s.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),xs.copy(this.boundingSphere),xs.applyMatrix4(n),t.ray.intersectsSphere(xs)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Wi),xc.multiplyMatrices(n,Wi),_s.matrixWorld=xc,_s.raycast(t,dr);for(let o=0,a=dr.length;o<a;o++){const l=dr[o];l.instanceId=r,l.object=this,e.push(l)}dr.length=0}}setColorAt(t,e){this.instanceColor===null&&(this.instanceColor=new _c(new Float32Array(this.instanceMatrix.count*3),3)),e.toArray(this.instanceColor.array,t*3)}setMatrixAt(t,e){e.toArray(this.instanceMatrix.array,t*16)}setMorphAt(t,e){const n=e.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new Tv(new Float32Array(s*this.count),s,this.count,du,Pn));const r=this.morphTexture.source.data.data;let o=0;for(let c=0;c<n.length;c++)o+=n[c];const a=this.geometry.morphTargetsRelative?1:1-o,l=s*t;r[l]=a,r.set(n,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}}class ln extends Zn{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new St(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}}const Or=new C,Fr=new C,Mc=new Jt,ys=new Os,fr=new yi,Oa=new C,Sc=new C;class Av extends ce{constructor(t=new qt,e=new ln){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,n=[0];for(let s=1,r=e.count;s<r;s++)Or.fromBufferAttribute(e,s-1),Fr.fromBufferAttribute(e,s),n[s]=n[s-1],n[s]+=Or.distanceTo(Fr);t.setAttribute("lineDistance",new zt(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(t,e){const n=this.geometry,s=this.matrixWorld,r=t.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),fr.copy(n.boundingSphere),fr.applyMatrix4(s),fr.radius+=r,t.ray.intersectsSphere(fr)===!1)return;Mc.copy(s).invert(),ys.copy(t.ray).applyMatrix4(Mc);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,u=n.index,d=n.attributes.position;if(u!==null){const p=Math.max(0,o.start),g=Math.min(u.count,o.start+o.count);for(let _=p,m=g-1;_<m;_+=c){const f=u.getX(_),S=u.getX(_+1),x=pr(this,t,ys,l,f,S);x&&e.push(x)}if(this.isLineLoop){const _=u.getX(g-1),m=u.getX(p),f=pr(this,t,ys,l,_,m);f&&e.push(f)}}else{const p=Math.max(0,o.start),g=Math.min(d.count,o.start+o.count);for(let _=p,m=g-1;_<m;_+=c){const f=pr(this,t,ys,l,_,_+1);f&&e.push(f)}if(this.isLineLoop){const _=pr(this,t,ys,l,g-1,p);_&&e.push(_)}}}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function pr(i,t,e,n,s,r){const o=i.geometry.attributes.position;if(Or.fromBufferAttribute(o,s),Fr.fromBufferAttribute(o,r),e.distanceSqToSegment(Or,Fr,Oa,Sc)>n)return;Oa.applyMatrix4(i.matrixWorld);const l=t.ray.origin.distanceTo(Oa);if(!(l<t.near||l>t.far))return{distance:l,point:Sc.clone().applyMatrix4(i.matrixWorld),index:s,face:null,faceIndex:null,object:i}}const bc=new C,Ec=new C;class pn extends Av{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,n=[];for(let s=0,r=e.count;s<r;s+=2)bc.fromBufferAttribute(e,s),Ec.fromBufferAttribute(e,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+bc.distanceTo(Ec);t.setAttribute("lineDistance",new zt(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class bs extends Zn{constructor(t){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new St(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}const Tc=new Jt,ho=new Os,mr=new yi,gr=new C;class vr extends ce{constructor(t=new qt,e=new bs){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}raycast(t,e){const n=this.geometry,s=this.matrixWorld,r=t.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),mr.copy(n.boundingSphere),mr.applyMatrix4(s),mr.radius+=r,t.ray.intersectsSphere(mr)===!1)return;Tc.copy(s).invert(),ho.copy(t.ray).applyMatrix4(Tc);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=n.index,h=n.attributes.position;if(c!==null){const d=Math.max(0,o.start),p=Math.min(c.count,o.start+o.count);for(let g=d,_=p;g<_;g++){const m=c.getX(g);gr.fromBufferAttribute(h,m),wc(gr,m,l,s,t,e,this)}}else{const d=Math.max(0,o.start),p=Math.min(h.count,o.start+o.count);for(let g=d,_=p;g<_;g++)gr.fromBufferAttribute(h,g),wc(gr,g,l,s,t,e,this)}}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function wc(i,t,e,n,s,r,o){const a=ho.distanceSqToPoint(i);if(a<e){const l=new C;ho.closestPointToPoint(i,l),l.applyMatrix4(n);const c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:t,face:null,object:o})}}class Br extends Ne{constructor(t,e,n,s,r,o,a,l,c){super(t,e,n,s,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class In{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(t,e){const n=this.getUtoTmapping(t);return this.getPoint(n,e)}getPoints(t=5){const e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return e}getSpacedPoints(t=5){const e=[];for(let n=0;n<=t;n++)e.push(this.getPointAt(n/t));return e}getLength(){const t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const e=[];let n,s=this.getPoint(0),r=0;e.push(0);for(let o=1;o<=t;o++)n=this.getPoint(o/t),r+=n.distanceTo(s),e.push(r),s=n;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e){const n=this.getLengths();let s=0;const r=n.length;let o;e?o=e:o=t*n[r-1];let a=0,l=r-1,c;for(;a<=l;)if(s=Math.floor(a+(l-a)/2),c=n[s]-o,c<0)a=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,n[s]===o)return s/(r-1);const u=n[s],d=n[s+1]-u,p=(o-u)/d;return(s+p)/(r-1)}getTangent(t,e){let s=t-1e-4,r=t+1e-4;s<0&&(s=0),r>1&&(r=1);const o=this.getPoint(s),a=this.getPoint(r),l=e||(o.isVector2?new tt:new C);return l.copy(a).sub(o).normalize(),l}getTangentAt(t,e){const n=this.getUtoTmapping(t);return this.getTangent(n,e)}computeFrenetFrames(t,e){const n=new C,s=[],r=[],o=[],a=new C,l=new Jt;for(let p=0;p<=t;p++){const g=p/t;s[p]=this.getTangentAt(g,new C)}r[0]=new C,o[0]=new C;let c=Number.MAX_VALUE;const u=Math.abs(s[0].x),h=Math.abs(s[0].y),d=Math.abs(s[0].z);u<=c&&(c=u,n.set(1,0,0)),h<=c&&(c=h,n.set(0,1,0)),d<=c&&n.set(0,0,1),a.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let p=1;p<=t;p++){if(r[p]=r[p-1].clone(),o[p]=o[p-1].clone(),a.crossVectors(s[p-1],s[p]),a.length()>Number.EPSILON){a.normalize();const g=Math.acos(Re(s[p-1].dot(s[p]),-1,1));r[p].applyMatrix4(l.makeRotationAxis(a,g))}o[p].crossVectors(s[p],r[p])}if(e===!0){let p=Math.acos(Re(r[0].dot(r[t]),-1,1));p/=t,s[0].dot(a.crossVectors(r[0],r[t]))>0&&(p=-p);for(let g=1;g<=t;g++)r[g].applyMatrix4(l.makeRotationAxis(s[g],p*g)),o[g].crossVectors(s[g],r[g])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){const t={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}}class Nu extends In{constructor(t=0,e=0,n=1,s=1,r=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(t,e=new tt){const n=e,s=Math.PI*2;let r=this.aEndAngle-this.aStartAngle;const o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(o?r=0:r=s),this.aClockwise===!0&&!o&&(r===s?r=-s:r=r-s);const a=this.aStartAngle+t*r;let l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){const u=Math.cos(this.aRotation),h=Math.sin(this.aRotation),d=l-this.aX,p=c-this.aY;l=d*u-p*h+this.aX,c=d*h+p*u+this.aY}return n.set(l,c)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){const t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}}class Cv extends Nu{constructor(t,e,n,s,r,o){super(t,e,n,n,s,r,o),this.isArcCurve=!0,this.type="ArcCurve"}}function Ro(){let i=0,t=0,e=0,n=0;function s(r,o,a,l){i=r,t=a,e=-3*r+3*o-2*a-l,n=2*r-2*o+a+l}return{initCatmullRom:function(r,o,a,l,c){s(o,a,c*(a-r),c*(l-o))},initNonuniformCatmullRom:function(r,o,a,l,c,u,h){let d=(o-r)/c-(a-r)/(c+u)+(a-o)/u,p=(a-o)/u-(l-o)/(u+h)+(l-a)/h;d*=u,p*=u,s(o,a,d,p)},calc:function(r){const o=r*r,a=o*r;return i+t*r+e*o+n*a}}}const _r=new C,Fa=new Ro,Ba=new Ro,za=new Ro;class Ou extends In{constructor(t=[],e=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=n,this.tension=s}getPoint(t,e=new C){const n=e,s=this.points,r=s.length,o=(r-(this.closed?0:1))*t;let a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:l===0&&a===r-1&&(a=r-2,l=1);let c,u;this.closed||a>0?c=s[(a-1)%r]:(_r.subVectors(s[0],s[1]).add(s[0]),c=_r);const h=s[a%r],d=s[(a+1)%r];if(this.closed||a+2<r?u=s[(a+2)%r]:(_r.subVectors(s[r-1],s[r-2]).add(s[r-1]),u=_r),this.curveType==="centripetal"||this.curveType==="chordal"){const p=this.curveType==="chordal"?.5:.25;let g=Math.pow(c.distanceToSquared(h),p),_=Math.pow(h.distanceToSquared(d),p),m=Math.pow(d.distanceToSquared(u),p);_<1e-4&&(_=1),g<1e-4&&(g=_),m<1e-4&&(m=_),Fa.initNonuniformCatmullRom(c.x,h.x,d.x,u.x,g,_,m),Ba.initNonuniformCatmullRom(c.y,h.y,d.y,u.y,g,_,m),za.initNonuniformCatmullRom(c.z,h.z,d.z,u.z,g,_,m)}else this.curveType==="catmullrom"&&(Fa.initCatmullRom(c.x,h.x,d.x,u.x,this.tension),Ba.initCatmullRom(c.y,h.y,d.y,u.y,this.tension),za.initCatmullRom(c.z,h.z,d.z,u.z,this.tension));return n.set(Fa.calc(l),Ba.calc(l),za.calc(l)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const s=t.points[e];this.points.push(s.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){const t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){const s=this.points[e];t.points.push(s.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const s=t.points[e];this.points.push(new C().fromArray(s))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}}function Ac(i,t,e,n,s){const r=(n-t)*.5,o=(s-e)*.5,a=i*i,l=i*a;return(2*e-2*n+r+o)*l+(-3*e+3*n-2*r-o)*a+r*i+e}function Rv(i,t){const e=1-i;return e*e*t}function Pv(i,t){return 2*(1-i)*i*t}function Lv(i,t){return i*i*t}function Es(i,t,e,n){return Rv(i,t)+Pv(i,e)+Lv(i,n)}function Dv(i,t){const e=1-i;return e*e*e*t}function Iv(i,t){const e=1-i;return 3*e*e*i*t}function Uv(i,t){return 3*(1-i)*i*i*t}function Nv(i,t){return i*i*i*t}function Ts(i,t,e,n,s){return Dv(i,t)+Iv(i,e)+Uv(i,n)+Nv(i,s)}class Ov extends In{constructor(t=new tt,e=new tt,n=new tt,s=new tt){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new tt){const n=e,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(Ts(t,s.x,r.x,o.x,a.x),Ts(t,s.y,r.y,o.y,a.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class Fv extends In{constructor(t=new C,e=new C,n=new C,s=new C){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new C){const n=e,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(Ts(t,s.x,r.x,o.x,a.x),Ts(t,s.y,r.y,o.y,a.y),Ts(t,s.z,r.z,o.z,a.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class Bv extends In{constructor(t=new tt,e=new tt){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new tt){const n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new tt){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class zv extends In{constructor(t=new C,e=new C){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new C){const n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new C){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class kv extends In{constructor(t=new tt,e=new tt,n=new tt){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new tt){const n=e,s=this.v0,r=this.v1,o=this.v2;return n.set(Es(t,s.x,r.x,o.x),Es(t,s.y,r.y,o.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class Fu extends In{constructor(t=new C,e=new C,n=new C){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new C){const n=e,s=this.v0,r=this.v1,o=this.v2;return n.set(Es(t,s.x,r.x,o.x),Es(t,s.y,r.y,o.y),Es(t,s.z,r.z,o.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class Hv extends In{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new tt){const n=e,s=this.points,r=(s.length-1)*t,o=Math.floor(r),a=r-o,l=s[o===0?o:o-1],c=s[o],u=s[o>s.length-2?s.length-1:o+1],h=s[o>s.length-3?s.length-1:o+2];return n.set(Ac(a,l.x,c.x,u.x,h.x),Ac(a,l.y,c.y,u.y,h.y)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const s=t.points[e];this.points.push(s.clone())}return this}toJSON(){const t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){const s=this.points[e];t.points.push(s.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const s=t.points[e];this.points.push(new tt().fromArray(s))}return this}}var Gv=Object.freeze({__proto__:null,ArcCurve:Cv,CatmullRomCurve3:Ou,CubicBezierCurve:Ov,CubicBezierCurve3:Fv,EllipseCurve:Nu,LineCurve:Bv,LineCurve3:zv,QuadraticBezierCurve:kv,QuadraticBezierCurve3:Fu,SplineCurve:Hv});class Po extends qt{constructor(t=1,e=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:n,thetaLength:s},e=Math.max(3,e);const r=[],o=[],a=[],l=[],c=new C,u=new tt;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let h=0,d=3;h<=e;h++,d+=3){const p=n+h/e*s;c.x=t*Math.cos(p),c.y=t*Math.sin(p),o.push(c.x,c.y,c.z),a.push(0,0,1),u.x=(o[d]/t+1)/2,u.y=(o[d+1]/t+1)/2,l.push(u.x,u.y)}for(let h=1;h<=e;h++)r.push(h,h+1,0);this.setIndex(r),this.setAttribute("position",new zt(o,3)),this.setAttribute("normal",new zt(a,3)),this.setAttribute("uv",new zt(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Po(t.radius,t.segments,t.thetaStart,t.thetaLength)}}class qe extends qt{constructor(t=1,e=1,n=1,s=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};const c=this;s=Math.floor(s),r=Math.floor(r);const u=[],h=[],d=[],p=[];let g=0;const _=[],m=n/2;let f=0;S(),o===!1&&(t>0&&x(!0),e>0&&x(!1)),this.setIndex(u),this.setAttribute("position",new zt(h,3)),this.setAttribute("normal",new zt(d,3)),this.setAttribute("uv",new zt(p,2));function S(){const T=new C,P=new C;let w=0;const A=(e-t)/n;for(let I=0;I<=r;I++){const E=[],y=I/r,L=y*(e-t)+t;for(let B=0;B<=s;B++){const z=B/s,$=z*l+a,Y=Math.sin($),W=Math.cos($);P.x=L*Y,P.y=-y*n+m,P.z=L*W,h.push(P.x,P.y,P.z),T.set(Y,A,W).normalize(),d.push(T.x,T.y,T.z),p.push(z,1-y),E.push(g++)}_.push(E)}for(let I=0;I<s;I++)for(let E=0;E<r;E++){const y=_[E][I],L=_[E+1][I],B=_[E+1][I+1],z=_[E][I+1];u.push(y,L,z),u.push(L,B,z),w+=6}c.addGroup(f,w,0),f+=w}function x(T){const P=g,w=new tt,A=new C;let I=0;const E=T===!0?t:e,y=T===!0?1:-1;for(let B=1;B<=s;B++)h.push(0,m*y,0),d.push(0,y,0),p.push(.5,.5),g++;const L=g;for(let B=0;B<=s;B++){const $=B/s*l+a,Y=Math.cos($),W=Math.sin($);A.x=E*W,A.y=m*y,A.z=E*Y,h.push(A.x,A.y,A.z),d.push(0,y,0),w.x=Y*.5+.5,w.y=W*.5*y+.5,p.push(w.x,w.y),g++}for(let B=0;B<s;B++){const z=P+B,$=L+B;T===!0?u.push($,$+1,z):u.push($+1,$,z),I+=3}c.addGroup(f,I,T===!0?1:2),f+=I}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new qe(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class mi extends qe{constructor(t=1,e=1,n=32,s=1,r=!1,o=0,a=Math.PI*2){super(0,t,e,n,s,r,o,a),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(t){return new mi(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class Lo extends qt{constructor(t=[],e=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:n,detail:s};const r=[],o=[];a(s),c(n),u(),this.setAttribute("position",new zt(r,3)),this.setAttribute("normal",new zt(r.slice(),3)),this.setAttribute("uv",new zt(o,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function a(S){const x=new C,T=new C,P=new C;for(let w=0;w<e.length;w+=3)p(e[w+0],x),p(e[w+1],T),p(e[w+2],P),l(x,T,P,S)}function l(S,x,T,P){const w=P+1,A=[];for(let I=0;I<=w;I++){A[I]=[];const E=S.clone().lerp(T,I/w),y=x.clone().lerp(T,I/w),L=w-I;for(let B=0;B<=L;B++)B===0&&I===w?A[I][B]=E:A[I][B]=E.clone().lerp(y,B/L)}for(let I=0;I<w;I++)for(let E=0;E<2*(w-I)-1;E++){const y=Math.floor(E/2);E%2===0?(d(A[I][y+1]),d(A[I+1][y]),d(A[I][y])):(d(A[I][y+1]),d(A[I+1][y+1]),d(A[I+1][y]))}}function c(S){const x=new C;for(let T=0;T<r.length;T+=3)x.x=r[T+0],x.y=r[T+1],x.z=r[T+2],x.normalize().multiplyScalar(S),r[T+0]=x.x,r[T+1]=x.y,r[T+2]=x.z}function u(){const S=new C;for(let x=0;x<r.length;x+=3){S.x=r[x+0],S.y=r[x+1],S.z=r[x+2];const T=m(S)/2/Math.PI+.5,P=f(S)/Math.PI+.5;o.push(T,1-P)}g(),h()}function h(){for(let S=0;S<o.length;S+=6){const x=o[S+0],T=o[S+2],P=o[S+4],w=Math.max(x,T,P),A=Math.min(x,T,P);w>.9&&A<.1&&(x<.2&&(o[S+0]+=1),T<.2&&(o[S+2]+=1),P<.2&&(o[S+4]+=1))}}function d(S){r.push(S.x,S.y,S.z)}function p(S,x){const T=S*3;x.x=t[T+0],x.y=t[T+1],x.z=t[T+2]}function g(){const S=new C,x=new C,T=new C,P=new C,w=new tt,A=new tt,I=new tt;for(let E=0,y=0;E<r.length;E+=9,y+=6){S.set(r[E+0],r[E+1],r[E+2]),x.set(r[E+3],r[E+4],r[E+5]),T.set(r[E+6],r[E+7],r[E+8]),w.set(o[y+0],o[y+1]),A.set(o[y+2],o[y+3]),I.set(o[y+4],o[y+5]),P.copy(S).add(x).add(T).divideScalar(3);const L=m(P);_(w,y+0,S,L),_(A,y+2,x,L),_(I,y+4,T,L)}}function _(S,x,T,P){P<0&&S.x===1&&(o[x]=S.x-1),T.x===0&&T.z===0&&(o[x]=P/2/Math.PI+.5)}function m(S){return Math.atan2(S.z,-S.x)}function f(S){return Math.atan2(-S.y,Math.sqrt(S.x*S.x+S.z*S.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Lo(t.vertices,t.indices,t.radius,t.details)}}class Do extends Lo{constructor(t=1,e=0){const n=(1+Math.sqrt(5))/2,s=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,t,e),this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new Do(t.radius,t.detail)}}class ws extends qt{constructor(t=.5,e=1,n=32,s=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:e,thetaSegments:n,phiSegments:s,thetaStart:r,thetaLength:o},n=Math.max(3,n),s=Math.max(1,s);const a=[],l=[],c=[],u=[];let h=t;const d=(e-t)/s,p=new C,g=new tt;for(let _=0;_<=s;_++){for(let m=0;m<=n;m++){const f=r+m/n*o;p.x=h*Math.cos(f),p.y=h*Math.sin(f),l.push(p.x,p.y,p.z),c.push(0,0,1),g.x=(p.x/e+1)/2,g.y=(p.y/e+1)/2,u.push(g.x,g.y)}h+=d}for(let _=0;_<s;_++){const m=_*(n+1);for(let f=0;f<n;f++){const S=f+m,x=S,T=S+n+1,P=S+n+2,w=S+1;a.push(x,T,w),a.push(T,P,w)}}this.setIndex(a),this.setAttribute("position",new zt(l,3)),this.setAttribute("normal",new zt(c,3)),this.setAttribute("uv",new zt(u,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new ws(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}}class gn extends qt{constructor(t=1,e=32,n=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));const l=Math.min(o+a,Math.PI);let c=0;const u=[],h=new C,d=new C,p=[],g=[],_=[],m=[];for(let f=0;f<=n;f++){const S=[],x=f/n;let T=0;f===0&&o===0?T=.5/e:f===n&&l===Math.PI&&(T=-.5/e);for(let P=0;P<=e;P++){const w=P/e;h.x=-t*Math.cos(s+w*r)*Math.sin(o+x*a),h.y=t*Math.cos(o+x*a),h.z=t*Math.sin(s+w*r)*Math.sin(o+x*a),g.push(h.x,h.y,h.z),d.copy(h).normalize(),_.push(d.x,d.y,d.z),m.push(w+T,1-x),S.push(c++)}u.push(S)}for(let f=0;f<n;f++)for(let S=0;S<e;S++){const x=u[f][S+1],T=u[f][S],P=u[f+1][S],w=u[f+1][S+1];(f!==0||o>0)&&p.push(x,T,w),(f!==n-1||l<Math.PI)&&p.push(T,P,w)}this.setIndex(p),this.setAttribute("position",new zt(g,3)),this.setAttribute("normal",new zt(_,3)),this.setAttribute("uv",new zt(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new gn(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}}class Io extends qt{constructor(t=new Fu(new C(-1,-1,0),new C(-1,1,0),new C(1,1,0)),e=64,n=1,s=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:t,tubularSegments:e,radius:n,radialSegments:s,closed:r};const o=t.computeFrenetFrames(e,r);this.tangents=o.tangents,this.normals=o.normals,this.binormals=o.binormals;const a=new C,l=new C,c=new tt;let u=new C;const h=[],d=[],p=[],g=[];_(),this.setIndex(g),this.setAttribute("position",new zt(h,3)),this.setAttribute("normal",new zt(d,3)),this.setAttribute("uv",new zt(p,2));function _(){for(let x=0;x<e;x++)m(x);m(r===!1?e:0),S(),f()}function m(x){u=t.getPointAt(x/e,u);const T=o.normals[x],P=o.binormals[x];for(let w=0;w<=s;w++){const A=w/s*Math.PI*2,I=Math.sin(A),E=-Math.cos(A);l.x=E*T.x+I*P.x,l.y=E*T.y+I*P.y,l.z=E*T.z+I*P.z,l.normalize(),d.push(l.x,l.y,l.z),a.x=u.x+n*l.x,a.y=u.y+n*l.y,a.z=u.z+n*l.z,h.push(a.x,a.y,a.z)}}function f(){for(let x=1;x<=e;x++)for(let T=1;T<=s;T++){const P=(s+1)*(x-1)+(T-1),w=(s+1)*x+(T-1),A=(s+1)*x+T,I=(s+1)*(x-1)+T;g.push(P,w,I),g.push(w,A,I)}}function S(){for(let x=0;x<=e;x++)for(let T=0;T<=s;T++)c.x=x/e,c.y=T/s,p.push(c.x,c.y)}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){const t=super.toJSON();return t.path=this.parameters.path.toJSON(),t}static fromJSON(t){return new Io(new Gv[t.path.type]().fromJSON(t.path),t.tubularSegments,t.radius,t.radialSegments,t.closed)}}class Vv extends Le{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class Kt extends Zn{constructor(t){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new St(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new St(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=gu,this.normalScale=new tt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Mn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class Uo extends ce{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new St(t),this.intensity=e}dispose(){}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){const e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,this.groundColor!==void 0&&(e.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(e.object.distance=this.distance),this.angle!==void 0&&(e.object.angle=this.angle),this.decay!==void 0&&(e.object.decay=this.decay),this.penumbra!==void 0&&(e.object.penumbra=this.penumbra),this.shadow!==void 0&&(e.object.shadow=this.shadow.toJSON()),e}}class Wv extends Uo{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(ce.DEFAULT_UP),this.updateMatrix(),this.groundColor=new St(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}}const ka=new Jt,Cc=new C,Rc=new C;class Bu{constructor(t){this.camera=t,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new tt(512,512),this.map=null,this.mapPass=null,this.matrix=new Jt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ao,this._frameExtents=new tt(1,1),this._viewportCount=1,this._viewports=[new ue(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){const e=this.camera,n=this.matrix;Cc.setFromMatrixPosition(t.matrixWorld),e.position.copy(Cc),Rc.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(Rc),e.updateMatrixWorld(),ka.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(ka),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(ka)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.bias=t.bias,this.radius=t.radius,this.mapSize.copy(t.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const t={};return this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}}const Pc=new Jt,Ms=new C,Ha=new C;class Xv extends Bu{constructor(){super(new nn(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new tt(4,2),this._viewportCount=6,this._viewports=[new ue(2,1,1,1),new ue(0,1,1,1),new ue(3,1,1,1),new ue(1,1,1,1),new ue(3,0,1,1),new ue(1,0,1,1)],this._cubeDirections=[new C(1,0,0),new C(-1,0,0),new C(0,0,1),new C(0,0,-1),new C(0,1,0),new C(0,-1,0)],this._cubeUps=[new C(0,1,0),new C(0,1,0),new C(0,1,0),new C(0,1,0),new C(0,0,1),new C(0,0,-1)]}updateMatrices(t,e=0){const n=this.camera,s=this.matrix,r=t.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),Ms.setFromMatrixPosition(t.matrixWorld),n.position.copy(Ms),Ha.copy(n.position),Ha.add(this._cubeDirections[e]),n.up.copy(this._cubeUps[e]),n.lookAt(Ha),n.updateMatrixWorld(),s.makeTranslation(-Ms.x,-Ms.y,-Ms.z),Pc.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Pc)}}class zu extends Uo{constructor(t,e,n=0,s=2){super(t,e),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new Xv}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}}class $v extends Bu{constructor(){super(new Xr(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Ga extends Uo{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(ce.DEFAULT_UP),this.updateMatrix(),this.target=new ce,this.shadow=new $v}dispose(){this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}}class ku{constructor(t=!0){this.autoStart=t,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=Lc(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let t=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const e=Lc();t=(e-this.oldTime)/1e3,this.oldTime=e,this.elapsedTime+=t}return t}}function Lc(){return(typeof performance>"u"?Date:performance).now()}const Dc=new Jt;class qv{constructor(t,e,n=0,s=1/0){this.ray=new Os(t,e),this.near=n,this.far=s,this.camera=null,this.layers=new wo,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,(e.near+e.far)/(e.near-e.far)).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):console.error("THREE.Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return Dc.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Dc),this}intersectObject(t,e=!0,n=[]){return fo(t,this,n,e),n.sort(Ic),n}intersectObjects(t,e=!0,n=[]){for(let s=0,r=t.length;s<r;s++)fo(t[s],this,n,e);return n.sort(Ic),n}}function Ic(i,t){return i.distance-t.distance}function fo(i,t,e,n){let s=!0;if(i.layers.test(t.layers)&&i.raycast(t,e)===!1&&(s=!1),s===!0&&n===!0){const r=i.children;for(let o=0,a=r.length;o<a;o++)fo(r[o],t,e,!0)}}class Uc{constructor(t=1,e=0,n=0){return this.radius=t,this.phi=e,this.theta=n,this}set(t,e,n){return this.radius=t,this.phi=e,this.theta=n,this}copy(t){return this.radius=t.radius,this.phi=t.phi,this.theta=t.theta,this}makeSafe(){return this.phi=Math.max(1e-6,Math.min(Math.PI-1e-6,this.phi)),this}setFromVector3(t){return this.setFromCartesianCoords(t.x,t.y,t.z)}setFromCartesianCoords(t,e,n){return this.radius=Math.sqrt(t*t+e*e+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(t,n),this.phi=Math.acos(Re(e/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:So}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=So);const Nc={type:"change"},Va={type:"start"},Oc={type:"end"},xr=new Os,Fc=new Gn,Yv=Math.cos(70*pf.DEG2RAD);class jv extends _i{constructor(t,e){super(),this.object=t,this.domElement=e,this.domElement.style.touchAction="none",this.enabled=!0,this.target=new C,this.cursor=new C,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Mi.ROTATE,MIDDLE:Mi.DOLLY,RIGHT:Mi.PAN},this.touches={ONE:Si.ROTATE,TWO:Si.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this.getPolarAngle=function(){return a.phi},this.getAzimuthalAngle=function(){return a.theta},this.getDistance=function(){return this.object.position.distanceTo(this.target)},this.listenToKeyEvents=function(v){v.addEventListener("keydown",st),this._domElementKeyEvents=v},this.stopListenToKeyEvents=function(){this._domElementKeyEvents.removeEventListener("keydown",st),this._domElementKeyEvents=null},this.saveState=function(){n.target0.copy(n.target),n.position0.copy(n.object.position),n.zoom0=n.object.zoom},this.reset=function(){n.target.copy(n.target0),n.object.position.copy(n.position0),n.object.zoom=n.zoom0,n.object.updateProjectionMatrix(),n.dispatchEvent(Nc),n.update(),r=s.NONE},this.update=function(){const v=new C,G=new gi().setFromUnitVectors(t.up,new C(0,1,0)),O=G.clone().invert(),V=new C,Z=new gi,Mt=new C,Rt=2*Math.PI;return function(_e=null){const jt=n.object.position;v.copy(jt).sub(n.target),v.applyQuaternion(G),a.setFromVector3(v),n.autoRotate&&r===s.NONE&&B(y(_e)),n.enableDamping?(a.theta+=l.theta*n.dampingFactor,a.phi+=l.phi*n.dampingFactor):(a.theta+=l.theta,a.phi+=l.phi);let xe=n.minAzimuthAngle,ye=n.maxAzimuthAngle;isFinite(xe)&&isFinite(ye)&&(xe<-Math.PI?xe+=Rt:xe>Math.PI&&(xe-=Rt),ye<-Math.PI?ye+=Rt:ye>Math.PI&&(ye-=Rt),xe<=ye?a.theta=Math.max(xe,Math.min(ye,a.theta)):a.theta=a.theta>(xe+ye)/2?Math.max(xe,a.theta):Math.min(ye,a.theta)),a.phi=Math.max(n.minPolarAngle,Math.min(n.maxPolarAngle,a.phi)),a.makeSafe(),n.enableDamping===!0?n.target.addScaledVector(u,n.dampingFactor):n.target.add(u),n.target.sub(n.cursor),n.target.clampLength(n.minTargetRadius,n.maxTargetRadius),n.target.add(n.cursor);let Ge=!1;if(n.zoomToCursor&&w||n.object.isOrthographicCamera)a.radius=dt(a.radius);else{const Ve=a.radius;a.radius=dt(a.radius*c),Ge=Ve!=a.radius}if(v.setFromSpherical(a),v.applyQuaternion(O),jt.copy(n.target).add(v),n.object.lookAt(n.target),n.enableDamping===!0?(l.theta*=1-n.dampingFactor,l.phi*=1-n.dampingFactor,u.multiplyScalar(1-n.dampingFactor)):(l.set(0,0,0),u.set(0,0,0)),n.zoomToCursor&&w){let Ve=null;if(n.object.isPerspectiveCamera){const Un=v.length();Ve=dt(Un*c);const Jn=Un-Ve;n.object.position.addScaledVector(T,Jn),n.object.updateMatrixWorld(),Ge=!!Jn}else if(n.object.isOrthographicCamera){const Un=new C(P.x,P.y,0);Un.unproject(n.object);const Jn=n.object.zoom;n.object.zoom=Math.max(n.minZoom,Math.min(n.maxZoom,n.object.zoom/c)),n.object.updateProjectionMatrix(),Ge=Jn!==n.object.zoom;const Qn=new C(P.x,P.y,0);Qn.unproject(n.object),n.object.position.sub(Qn).add(Un),n.object.updateMatrixWorld(),Ve=v.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),n.zoomToCursor=!1;Ve!==null&&(this.screenSpacePanning?n.target.set(0,0,-1).transformDirection(n.object.matrix).multiplyScalar(Ve).add(n.object.position):(xr.origin.copy(n.object.position),xr.direction.set(0,0,-1).transformDirection(n.object.matrix),Math.abs(n.object.up.dot(xr.direction))<Yv?t.lookAt(n.target):(Fc.setFromNormalAndCoplanarPoint(n.object.up,n.target),xr.intersectPlane(Fc,n.target))))}else if(n.object.isOrthographicCamera){const Ve=n.object.zoom;n.object.zoom=Math.max(n.minZoom,Math.min(n.maxZoom,n.object.zoom/c)),Ve!==n.object.zoom&&(n.object.updateProjectionMatrix(),Ge=!0)}return c=1,w=!1,Ge||V.distanceToSquared(n.object.position)>o||8*(1-Z.dot(n.object.quaternion))>o||Mt.distanceToSquared(n.target)>o?(n.dispatchEvent(Nc),V.copy(n.object.position),Z.copy(n.object.quaternion),Mt.copy(n.target),!0):!1}}(),this.dispose=function(){n.domElement.removeEventListener("contextmenu",vt),n.domElement.removeEventListener("pointerdown",he),n.domElement.removeEventListener("pointercancel",M),n.domElement.removeEventListener("wheel",J),n.domElement.removeEventListener("pointermove",R),n.domElement.removeEventListener("pointerup",M),n.domElement.getRootNode().removeEventListener("keydown",yt,{capture:!0}),n._domElementKeyEvents!==null&&(n._domElementKeyEvents.removeEventListener("keydown",st),n._domElementKeyEvents=null)};const n=this,s={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6};let r=s.NONE;const o=1e-6,a=new Uc,l=new Uc;let c=1;const u=new C,h=new tt,d=new tt,p=new tt,g=new tt,_=new tt,m=new tt,f=new tt,S=new tt,x=new tt,T=new C,P=new tt;let w=!1;const A=[],I={};let E=!1;function y(v){return v!==null?2*Math.PI/60*n.autoRotateSpeed*v:2*Math.PI/60/60*n.autoRotateSpeed}function L(v){const G=Math.abs(v*.01);return Math.pow(.95,n.zoomSpeed*G)}function B(v){l.theta-=v}function z(v){l.phi-=v}const $=function(){const v=new C;return function(O,V){v.setFromMatrixColumn(V,0),v.multiplyScalar(-O),u.add(v)}}(),Y=function(){const v=new C;return function(O,V){n.screenSpacePanning===!0?v.setFromMatrixColumn(V,1):(v.setFromMatrixColumn(V,0),v.crossVectors(n.object.up,v)),v.multiplyScalar(O),u.add(v)}}(),W=function(){const v=new C;return function(O,V){const Z=n.domElement;if(n.object.isPerspectiveCamera){const Mt=n.object.position;v.copy(Mt).sub(n.target);let Rt=v.length();Rt*=Math.tan(n.object.fov/2*Math.PI/180),$(2*O*Rt/Z.clientHeight,n.object.matrix),Y(2*V*Rt/Z.clientHeight,n.object.matrix)}else n.object.isOrthographicCamera?($(O*(n.object.right-n.object.left)/n.object.zoom/Z.clientWidth,n.object.matrix),Y(V*(n.object.top-n.object.bottom)/n.object.zoom/Z.clientHeight,n.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),n.enablePan=!1)}}();function j(v){n.object.isPerspectiveCamera||n.object.isOrthographicCamera?c/=v:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),n.enableZoom=!1)}function X(v){n.object.isPerspectiveCamera||n.object.isOrthographicCamera?c*=v:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),n.enableZoom=!1)}function ht(v,G){if(!n.zoomToCursor)return;w=!0;const O=n.domElement.getBoundingClientRect(),V=v-O.left,Z=G-O.top,Mt=O.width,Rt=O.height;P.x=V/Mt*2-1,P.y=-(Z/Rt)*2+1,T.set(P.x,P.y,1).unproject(n.object).sub(n.object.position).normalize()}function dt(v){return Math.max(n.minDistance,Math.min(n.maxDistance,v))}function gt(v){h.set(v.clientX,v.clientY)}function Gt(v){ht(v.clientX,v.clientX),f.set(v.clientX,v.clientY)}function Yt(v){g.set(v.clientX,v.clientY)}function q(v){d.set(v.clientX,v.clientY),p.subVectors(d,h).multiplyScalar(n.rotateSpeed);const G=n.domElement;B(2*Math.PI*p.x/G.clientHeight),z(2*Math.PI*p.y/G.clientHeight),h.copy(d),n.update()}function et(v){S.set(v.clientX,v.clientY),x.subVectors(S,f),x.y>0?j(L(x.y)):x.y<0&&X(L(x.y)),f.copy(S),n.update()}function ft(v){_.set(v.clientX,v.clientY),m.subVectors(_,g).multiplyScalar(n.panSpeed),W(m.x,m.y),g.copy(_),n.update()}function ot(v){ht(v.clientX,v.clientY),v.deltaY<0?X(L(v.deltaY)):v.deltaY>0&&j(L(v.deltaY)),n.update()}function Ft(v){let G=!1;switch(v.code){case n.keys.UP:v.ctrlKey||v.metaKey||v.shiftKey?z(2*Math.PI*n.rotateSpeed/n.domElement.clientHeight):W(0,n.keyPanSpeed),G=!0;break;case n.keys.BOTTOM:v.ctrlKey||v.metaKey||v.shiftKey?z(-2*Math.PI*n.rotateSpeed/n.domElement.clientHeight):W(0,-n.keyPanSpeed),G=!0;break;case n.keys.LEFT:v.ctrlKey||v.metaKey||v.shiftKey?B(2*Math.PI*n.rotateSpeed/n.domElement.clientHeight):W(n.keyPanSpeed,0),G=!0;break;case n.keys.RIGHT:v.ctrlKey||v.metaKey||v.shiftKey?B(-2*Math.PI*n.rotateSpeed/n.domElement.clientHeight):W(-n.keyPanSpeed,0),G=!0;break}G&&(v.preventDefault(),n.update())}function Pt(v){if(A.length===1)h.set(v.pageX,v.pageY);else{const G=Ut(v),O=.5*(v.pageX+G.x),V=.5*(v.pageY+G.y);h.set(O,V)}}function Vt(v){if(A.length===1)g.set(v.pageX,v.pageY);else{const G=Ut(v),O=.5*(v.pageX+G.x),V=.5*(v.pageY+G.y);g.set(O,V)}}function D(v){const G=Ut(v),O=v.pageX-G.x,V=v.pageY-G.y,Z=Math.sqrt(O*O+V*V);f.set(0,Z)}function Wt(v){n.enableZoom&&D(v),n.enablePan&&Vt(v)}function Ht(v){n.enableZoom&&D(v),n.enableRotate&&Pt(v)}function ae(v){if(A.length==1)d.set(v.pageX,v.pageY);else{const O=Ut(v),V=.5*(v.pageX+O.x),Z=.5*(v.pageY+O.y);d.set(V,Z)}p.subVectors(d,h).multiplyScalar(n.rotateSpeed);const G=n.domElement;B(2*Math.PI*p.x/G.clientHeight),z(2*Math.PI*p.y/G.clientHeight),h.copy(d)}function Et(v){if(A.length===1)_.set(v.pageX,v.pageY);else{const G=Ut(v),O=.5*(v.pageX+G.x),V=.5*(v.pageY+G.y);_.set(O,V)}m.subVectors(_,g).multiplyScalar(n.panSpeed),W(m.x,m.y),g.copy(_)}function Xt(v){const G=Ut(v),O=v.pageX-G.x,V=v.pageY-G.y,Z=Math.sqrt(O*O+V*V);S.set(0,Z),x.set(0,Math.pow(S.y/f.y,n.zoomSpeed)),j(x.y),f.copy(S);const Mt=(v.pageX+G.x)*.5,Rt=(v.pageY+G.y)*.5;ht(Mt,Rt)}function Bt(v){n.enableZoom&&Xt(v),n.enablePan&&Et(v)}function Lt(v){n.enableZoom&&Xt(v),n.enableRotate&&ae(v)}function he(v){n.enabled!==!1&&(A.length===0&&(n.domElement.setPointerCapture(v.pointerId),n.domElement.addEventListener("pointermove",R),n.domElement.addEventListener("pointerup",M)),!lt(v)&&(kt(v),v.pointerType==="touch"?Dt(v):H(v)))}function R(v){n.enabled!==!1&&(v.pointerType==="touch"?nt(v):K(v))}function M(v){switch(wt(v),A.length){case 0:n.domElement.releasePointerCapture(v.pointerId),n.domElement.removeEventListener("pointermove",R),n.domElement.removeEventListener("pointerup",M),n.dispatchEvent(Oc),r=s.NONE;break;case 1:const G=A[0],O=I[G];Dt({pointerId:G,pageX:O.x,pageY:O.y});break}}function H(v){let G;switch(v.button){case 0:G=n.mouseButtons.LEFT;break;case 1:G=n.mouseButtons.MIDDLE;break;case 2:G=n.mouseButtons.RIGHT;break;default:G=-1}switch(G){case Mi.DOLLY:if(n.enableZoom===!1)return;Gt(v),r=s.DOLLY;break;case Mi.ROTATE:if(v.ctrlKey||v.metaKey||v.shiftKey){if(n.enablePan===!1)return;Yt(v),r=s.PAN}else{if(n.enableRotate===!1)return;gt(v),r=s.ROTATE}break;case Mi.PAN:if(v.ctrlKey||v.metaKey||v.shiftKey){if(n.enableRotate===!1)return;gt(v),r=s.ROTATE}else{if(n.enablePan===!1)return;Yt(v),r=s.PAN}break;default:r=s.NONE}r!==s.NONE&&n.dispatchEvent(Va)}function K(v){switch(r){case s.ROTATE:if(n.enableRotate===!1)return;q(v);break;case s.DOLLY:if(n.enableZoom===!1)return;et(v);break;case s.PAN:if(n.enablePan===!1)return;ft(v);break}}function J(v){n.enabled===!1||n.enableZoom===!1||r!==s.NONE||(v.preventDefault(),n.dispatchEvent(Va),ot(Q(v)),n.dispatchEvent(Oc))}function Q(v){const G=v.deltaMode,O={clientX:v.clientX,clientY:v.clientY,deltaY:v.deltaY};switch(G){case 1:O.deltaY*=16;break;case 2:O.deltaY*=100;break}return v.ctrlKey&&!E&&(O.deltaY*=10),O}function yt(v){v.key==="Control"&&(E=!0,n.domElement.getRootNode().addEventListener("keyup",rt,{passive:!0,capture:!0}))}function rt(v){v.key==="Control"&&(E=!1,n.domElement.getRootNode().removeEventListener("keyup",rt,{passive:!0,capture:!0}))}function st(v){n.enabled===!1||n.enablePan===!1||Ft(v)}function Dt(v){switch(It(v),A.length){case 1:switch(n.touches.ONE){case Si.ROTATE:if(n.enableRotate===!1)return;Pt(v),r=s.TOUCH_ROTATE;break;case Si.PAN:if(n.enablePan===!1)return;Vt(v),r=s.TOUCH_PAN;break;default:r=s.NONE}break;case 2:switch(n.touches.TWO){case Si.DOLLY_PAN:if(n.enableZoom===!1&&n.enablePan===!1)return;Wt(v),r=s.TOUCH_DOLLY_PAN;break;case Si.DOLLY_ROTATE:if(n.enableZoom===!1&&n.enableRotate===!1)return;Ht(v),r=s.TOUCH_DOLLY_ROTATE;break;default:r=s.NONE}break;default:r=s.NONE}r!==s.NONE&&n.dispatchEvent(Va)}function nt(v){switch(It(v),r){case s.TOUCH_ROTATE:if(n.enableRotate===!1)return;ae(v),n.update();break;case s.TOUCH_PAN:if(n.enablePan===!1)return;Et(v),n.update();break;case s.TOUCH_DOLLY_PAN:if(n.enableZoom===!1&&n.enablePan===!1)return;Bt(v),n.update();break;case s.TOUCH_DOLLY_ROTATE:if(n.enableZoom===!1&&n.enableRotate===!1)return;Lt(v),n.update();break;default:r=s.NONE}}function vt(v){n.enabled!==!1&&v.preventDefault()}function kt(v){A.push(v.pointerId)}function wt(v){delete I[v.pointerId];for(let G=0;G<A.length;G++)if(A[G]==v.pointerId){A.splice(G,1);return}}function lt(v){for(let G=0;G<A.length;G++)if(A[G]==v.pointerId)return!0;return!1}function It(v){let G=I[v.pointerId];G===void 0&&(G=new tt,I[v.pointerId]=G),G.set(v.pageX,v.pageY)}function Ut(v){const G=v.pointerId===A[0]?A[1]:A[0];return I[G]}n.domElement.addEventListener("contextmenu",vt),n.domElement.addEventListener("pointerdown",he),n.domElement.addEventListener("pointercancel",M),n.domElement.addEventListener("wheel",J,{passive:!1}),n.domElement.getRootNode().addEventListener("keydown",yt,{passive:!0,capture:!0}),this.update()}}const Kv={harbor:[-6.2,-2.6],core:[0,-1.2],riverbend:[3.1,4.4],industry:[-4.2,4],garden:[6.2,-2.6],hillside:[1.4,-7.9]};function Bc(i){return i.archetype==="downtown"?5467495:i.archetype==="industrial"?5857625:i.archetype==="residential"?6197097:i.archetype==="upland"?4684356:i.archetype==="river"?5603203:6651759}function wr(i){return i.archetype==="downtown"?42:i.archetype==="industrial"?14:i.archetype==="residential"?20:i.archetype==="upland"?7:i.archetype==="river"?18:20}function Wa(i,t,e){const n=wr(i),s=i.archetype==="downtown"?7:i.archetype==="industrial"?4:i.archetype==="upland"?3:5,r=Math.ceil(n/s),o=i.archetype==="industrial"?1.28:i.archetype==="upland"?1.35:.86,a=e%s,l=Math.floor(e/s),c=(mt(t*41+e*3)-.5)*(i.archetype==="downtown"?.14:.24),u=(mt(t*61+e*7)-.5)*(i.archetype==="upland"?.38:.18),h=-((s-1)*o)/2+a*o+c,d=-((r-1)*o)/2+l*o+u,p=Zv(i,e),g=(mt(t*70+e)-.5)*(i.archetype==="residential"?.34:.16),_=i.archetype==="upland"?po(h,d,t)+.08:.18;return i.archetype==="industrial"?{x:h,z:d,baseY:_,height:p,scaleX:1.12+mt(t*17+e)*.58,scaleZ:.74+mt(t*23+e)*.62,rotationY:g}:i.archetype==="residential"?{x:h,z:d,baseY:_,height:p,scaleX:.92+mt(t*13+e)*.2,scaleZ:.54+mt(t*29+e)*.22,rotationY:g}:i.archetype==="upland"?{x:h,z:d,baseY:_,height:p,scaleX:.55+mt(t*19+e)*.18,scaleZ:.5+mt(t*31+e)*.18,rotationY:g}:{x:h,z:d,baseY:_,height:p,scaleX:i.archetype==="downtown"?.68+mt(t*13+e)*.2:.72,scaleZ:i.archetype==="downtown"?.68+mt(t*17+e)*.2:.68,rotationY:g}}function Zv(i,t){const e=i.imperviousness,n=mt((t+1)*17);return i.archetype==="downtown"?re(2.3+e*4.1+n*4.4,2.2,9.4):i.archetype==="industrial"?re(.7+e*.85+n*.9,.85,2.3):i.archetype==="residential"?re(.95+e*1.1+n*1.1,1,3.1):i.archetype==="upland"?re(.42+e*.55+n*.45,.45,1.15):i.archetype==="river"?re(.9+e*1.7+n*1.4,.9,4):re(1+e*1.8+n*1.6,1,4.4)}function po(i,t,e=0){const n=Math.max(0,(2.6-t)/5.2),s=Math.sin((i+e)*1.7)*.12+Math.cos((t-e)*1.3)*.1;return .12+n*1.25+s}function mt(i){const t=Math.sin(i*12.9898)*43758.5453;return t-Math.floor(t)}function Jv(i,t,e){const n=re(e,0,1),s=new St(i);return s.lerp(new St(t),n),s.getHex()}function Xa(i){return i==="heat"?{background:4860449,fog:10968888,fogDensity:.024,skyTop:12087107,skyBottom:3692125,skyAccent:16747082,waterGlow:3520980,particle:16747082,street:16760938,windowGlow:16765066}:i==="rain"?{background:1521739,fog:3632518,fogDensity:.032,skyTop:4946064,skyBottom:1521739,skyAccent:6018815,waterGlow:6543615,particle:8119039,street:7526911,windowGlow:13235455}:i==="air"?{background:5065010,fog:10783570,fogDensity:.039,skyTop:10324834,skyBottom:3753787,skyAccent:13938779,waterGlow:5220020,particle:13938779,street:13090936,windowGlow:16768906}:i==="energy"?{background:3815204,fog:9141053,fogDensity:.024,skyTop:9073984,skyBottom:2506564,skyAccent:16769146,waterGlow:6806472,particle:16769146,street:16771480,windowGlow:16773286}:{background:1522501,fog:4094063,fogDensity:.025,skyTop:7316389,skyBottom:1522501,skyAccent:9764816,waterGlow:6018815,particle:9764816,street:9437138,windowGlow:14548969}}function Qv(i){return i==="rain"?{size:.033,opacity:.4}:i==="heat"?{size:.052,opacity:.34}:i==="air"?{size:.058,opacity:.27}:i==="energy"?{size:.045,opacity:.42}:{size:.038,opacity:.22}}function t_(i){return i==="cooling"||i==="biodiversity"?8191886:i==="flood"?6871551:i==="energy"?16770689:i==="mobility"?8251391:i==="health"?16752560:i==="industry"?12177872:12429055}function e_(i){return i==="rain"?new C(1.8,.2,3.6):i==="heat"?new C(0,.25,-1.2):i==="air"?new C(-4.2,.45,4):i==="energy"?new C(0,2.2,-1.2):new C(0,.6,-1.2)}function n_(i,t){const e={core:[-2,1.85],harbor:[1.3,1.45],riverbend:[-1.65,-1.35],industry:[1.5,-1.25],garden:[-1.4,1.55],hillside:[-1.25,-.75]},[n,s]=e[i]??[0,0];return new C(t.x+n,t.y,t.z+s)}function i_(i){return i?`${i.year}:${i.turn}:${i.policyId}:${i.targetDistrictId??"city"}`:""}function s_(i){return i.lastResolution?`${i.lastResolution.year}:${i.lastResolution.title}:${i.lastResolution.soundCue}`:""}function mn(i,t,e){const n=t*3,s=Math.random()*Math.PI*2,r=e==="mobility"||e==="biodiversity"||e==="governance",o=Math.sqrt(Math.random())*(r?3.4:2.2);i[n]=Math.cos(s)*o,i[n+2]=Math.sin(s)*o,e==="flood"||e==="mobility"||e==="biodiversity"?i[n+1]=.08+Math.random()*.3:e==="energy"?i[n+1]=1.2+Math.random()*1.9:e==="cooling"?i[n+1]=1+Math.random()*1.9:i[n+1]=.18+Math.random()*.7}function Xi(i,t,e){const n=t*3;if(e==="rain"){i[n]=(Math.random()-.5)*13,i[n+1]=3+Math.random()*6.5,i[n+2]=(Math.random()-.5)*7.5;return}if(e==="heat"){i[n]=(Math.random()-.5)*7,i[n+1]=.2+Math.random()*1,i[n+2]=(Math.random()-.5)*5.4;return}if(e==="air"){i[n]=-7+Math.random()*1.6,i[n+1]=.6+Math.random()*3.6,i[n+2]=(Math.random()-.5)*6.4;return}if(e==="energy"){const s=Math.random()*Math.PI*2,r=.6+Math.random()*3.4;i[n]=Math.cos(s)*r,i[n+1]=.6+Math.random()*4.8,i[n+2]=Math.sin(s)*r;return}i[n]=(Math.random()-.5)*7.5,i[n+1]=.5+Math.random()*3,i[n+2]=(Math.random()-.5)*6}function $a(i,t,e,n){const s=t*3;i[s]=(Math.random()-.5)*22,i[s+1]=n??(e==="rain"?3.2+Math.random()*4.2:.45+Math.random()*4.8),i[s+2]=(Math.random()-.5)*18}function r_(){const i=document.createElement("canvas");i.width=512,i.height=512;const t=i.getContext("2d");if(!t)return new Br(i);const e=t.createLinearGradient(0,0,512,512);e.addColorStop(0,"#173034"),e.addColorStop(.52,"#10282d"),e.addColorStop(1,"#0b1d23"),t.fillStyle=e,t.fillRect(0,0,512,512),t.globalAlpha=.18,t.strokeStyle="#7be2d4",t.lineWidth=3;for(let s=42;s<512;s+=74)t.beginPath(),t.moveTo(s,0),t.lineTo(s+36,512),t.stroke(),t.beginPath(),t.moveTo(0,s),t.lineTo(512,s+18),t.stroke();t.globalAlpha=.12,t.strokeStyle="#f5d57a",t.lineWidth=1;for(let s=18;s<512;s+=38)t.beginPath(),t.moveTo(s,0),t.lineTo(s,512),t.stroke();t.globalAlpha=.08,t.fillStyle="#d7fff2";for(let s=0;s<320;s+=1){const r=mt(s*23)*512,o=mt(s*41)*512;t.fillRect(r,o,1.2,1.2)}const n=new Br(i);return n.colorSpace=tn,n.wrapS=Ls,n.wrapT=Ls,n.repeat.set(2,2),n.anisotropy=4,n}const a_=5.2,yr=a_/Qe,Yr=8,Mr=Yr*16*4,qa=Yr*16*2,Sr=Yr*16,zc=4,Ya=12,o_=3,$t=new ce,$i=new Jt().makeScale(0,0,0);class l_{constructor(t,e){ct(this,"trunks");ct(this,"crowns");ct(this,"panels");ct(this,"shelterBodies");ct(this,"shelterRoofs");ct(this,"cars");ct(this,"birds");ct(this,"clouds",[]);ct(this,"labels",new Map);ct(this,"districtOrigins",new Map);ct(this,"birdVisible",6);ct(this,"birdCenter",new C(0,0,-1.2));ct(this,"lastLayer","none");this.root=t,this.districtOrigins=e,this.trunks=new cn(new qe(.025,.04,.26,5),new Kt({color:7031340,roughness:.9}),Mr),this.crowns=new cn(new Do(.16,0),new Kt({color:4039265,roughness:.8,emissive:1061660,emissiveIntensity:.25}),Mr),this.crowns.castShadow=!0,this.panels=new cn(new le(.46,.02,.3),new Kt({color:1915535,roughness:.25,metalness:.7,emissive:2245802,emissiveIntensity:.35}),qa),this.shelterBodies=new cn(new le(.34,.22,.34),new Kt({color:14275264,roughness:.7}),Sr),this.shelterRoofs=new cn(new mi(.27,.16,4),new Kt({color:13209917,emissive:8014352,emissiveIntensity:.45,roughness:.6}),Sr),this.cars=new cn(new le(.22,.09,.12),new Kt({color:16777215,roughness:.4,metalness:.3}),Yr*zc);const n=[14247261,6135513,14731098,9427343,13224393],s=new St;for(let o=0;o<this.cars.count;o+=1)s.setHex(n[o%n.length]),this.cars.setColorAt(o,s);this.birds=new cn(new mi(.05,.16,3),new ke({color:14611455,transparent:!0,opacity:.85}),Ya),this.birds.frustumCulled=!1;const r=u_();for(let o=0;o<o_;o+=1){const a=new vc(new uo({map:r,transparent:!0,opacity:.32,depthWrite:!1}));a.scale.set(6+o*1.6,2.2+o*.5,1),a.position.set(-8+o*7,7.4+o*.7,-4-o*2),this.clouds.push(a),t.add(a)}t.add(this.trunks,this.crowns,this.panels,this.shelterBodies,this.shelterRoofs,this.cars,this.birds)}update(t,e){this.lastLayer=e;let n=0,s=0,r=0;const o=new St,a=e==="none";for(const l of t.districts){const c=this.districtOrigins.get(l.id);c&&(l.id==="core"&&this.birdCenter.copy(c),l.cells.forEach((u,h)=>{const d=h%Qe,p=Math.floor(h/Qe),g=c.x+(d-(Qe-1)/2)*yr,_=c.z+(p-(Qe-1)/2)*yr,m=l.id.charCodeAt(0)*97+h*31;if(u==="green"&&a){const f=2+Math.floor(mt(m)*3);for(let S=0;S<f&&n<Mr;S+=1){const x=(mt(m+S*7)-.5)*yr*.7,T=(mt(m+S*13)-.5)*yr*.7,P=.8+mt(m+S*19)*.55;$t.position.set(g+x,.15+.13*P,_+T),$t.scale.setScalar(P),$t.rotation.set(0,mt(m+S)*Math.PI,0),$t.updateMatrix(),this.trunks.setMatrixAt(n,$t.matrix),$t.position.y=.15+(.26+.1)*P,$t.updateMatrix(),this.crowns.setMatrixAt(n,$t.matrix),o.setHSL(.36+mt(m+S*5)*.05,.55,.32+mt(m+S*3)*.1),this.crowns.setColorAt(n,o),n+=1}}else if(u==="solar"&&a)for(let f=0;f<2&&s<qa;f+=1)$t.position.set(g+(f-.5)*.5,.2,_+(mt(m+f)-.5)*.3),$t.rotation.set(-.42,0,0),$t.scale.setScalar(1),$t.updateMatrix(),this.panels.setMatrixAt(s,$t.matrix),s+=1;else u==="shelter"&&a&&r<Sr&&($t.position.set(g,.26,_),$t.rotation.set(0,mt(m)*Math.PI*.5,0),$t.scale.setScalar(1),$t.updateMatrix(),this.shelterBodies.setMatrixAt(r,$t.matrix),$t.position.y=.26+.19,$t.rotation.y+=Math.PI/4,$t.updateMatrix(),this.shelterRoofs.setMatrixAt(r,$t.matrix),r+=1)}),this.updateLabel(l,c,e))}for(let l=n;l<Mr;l+=1)this.trunks.setMatrixAt(l,$i),this.crowns.setMatrixAt(l,$i);for(let l=s;l<qa;l+=1)this.panels.setMatrixAt(l,$i);for(let l=r;l<Sr;l+=1)this.shelterBodies.setMatrixAt(l,$i),this.shelterRoofs.setMatrixAt(l,$i);this.trunks.instanceMatrix.needsUpdate=!0,this.crowns.instanceMatrix.needsUpdate=!0,this.crowns.instanceColor&&(this.crowns.instanceColor.needsUpdate=!0),this.panels.instanceMatrix.needsUpdate=!0,this.shelterBodies.instanceMatrix.needsUpdate=!0,this.shelterRoofs.instanceMatrix.needsUpdate=!0,this.birdVisible=Math.max(3,Math.min(Ya,Math.round(3+t.biodiversity/9)))}tick(t){let e=0;const n=2.62,s=n*8;for(const r of this.districtOrigins.values())for(let o=0;o<zc;o+=1){const a=.55+mt(e*23)*.35,l=((t*a+e*1.7)%s+s)%s,{x:c,z:u,angle:h}=c_(l,n);$t.position.set(r.x+c,.27,r.z+u),$t.rotation.set(0,h,0),$t.scale.setScalar(1),$t.updateMatrix(),this.cars.setMatrixAt(e,$t.matrix),e+=1}this.cars.instanceMatrix.needsUpdate=!0,this.cars.instanceColor&&(this.cars.instanceColor.needsUpdate=!0);for(let r=0;r<Ya;r+=1){if(r>=this.birdVisible){this.birds.setMatrixAt(r,$i);continue}const o=r*.7,a=3.2+r%4*.55,l=t*(.32+r%3*.07)+o,c=this.birdCenter.x+Math.cos(l)*a,u=this.birdCenter.z+Math.sin(l)*a,h=6.4+Math.sin(t*1.6+o)*.4+r%3*.35;$t.position.set(c,h,u),$t.rotation.set(Math.PI/2,0,-l),$t.scale.setScalar(1),$t.updateMatrix(),this.birds.setMatrixAt(r,$t.matrix)}this.birds.instanceMatrix.needsUpdate=!0,this.clouds.forEach((r,o)=>{r.position.x+=.0035+o*.0012,r.position.x>14&&(r.position.x=-14)})}updateLabel(t,e,n){var l;const s=n==="uhi"?`${t.name}  ${(t.uhiDeltaC??0)>=0?"+":""}${(t.uhiDeltaC??0).toFixed(1)}°C`:n==="runoff"?`${t.name}  C=${(t.runoffCoefficient??0).toFixed(2)}`:t.name,r=n==="uhi"?"#ffb070":n==="runoff"?"#7fd4ff":"#9fe8d8",o=`${s}|${r}`;let a=this.labels.get(t.id);if(!a){const c=new vc(new uo({transparent:!0,depthWrite:!1,opacity:.92}));c.position.set(e.x,3.4,e.z),c.renderOrder=9,this.root.add(c),a={sprite:c,cacheKey:""},this.labels.set(t.id,a)}if(a.cacheKey!==o){a.cacheKey=o;const c=h_(s,r),u=a.sprite.material;(l=u.map)==null||l.dispose(),u.map=c,u.needsUpdate=!0;const h=c.image.width/c.image.height;a.sprite.scale.set(.55*h,.55,1)}a.sprite.visible=n==="none"||n==="uhi"||n==="runoff"}}function c_(i,t){const e=t*2;return i<e?{x:-t+i,z:-t,angle:Math.PI/2}:i<e*2?{x:t,z:-t+(i-e),angle:0}:i<e*3?{x:t-(i-e*2),z:t,angle:-Math.PI/2}:{x:-t,z:t-(i-e*3),angle:Math.PI}}function u_(){const i=document.createElement("canvas");i.width=256,i.height=96;const t=i.getContext("2d");for(const[e,n,s]of[[70,56,38],[120,44,46],[175,56,36],[120,64,50]]){const r=t.createRadialGradient(e,n,4,e,n,s);r.addColorStop(0,"rgba(225,238,248,0.85)"),r.addColorStop(1,"rgba(225,238,248,0)"),t.fillStyle=r,t.fillRect(0,0,256,96)}return new Br(i)}function h_(i,t){const e=document.createElement("canvas"),n=e.getContext("2d");n.font='600 30px "Noto Sans TC", system-ui, sans-serif';const s=Math.ceil(n.measureText(i).width)+36;e.width=s,e.height=52;const r=e.getContext("2d");r.fillStyle="rgba(6, 20, 27, 0.78)",kc(r,1,1,s-2,50,12),r.fill(),r.strokeStyle=t,r.globalAlpha=.55,kc(r,1,1,s-2,50,12),r.stroke(),r.globalAlpha=1,r.font='600 30px "Noto Sans TC", system-ui, sans-serif',r.fillStyle=t,r.textBaseline="middle",r.fillText(i,18,27);const o=new Br(e);return o.anisotropy=2,o}function kc(i,t,e,n,s,r){i.beginPath(),i.moveTo(t+r,e),i.arcTo(t+n,e,t+n,e+s,r),i.arcTo(t+n,e+s,t,e+s,r),i.arcTo(t,e+s,t,e,r),i.arcTo(t,e,t+n,e,r),i.closePath()}function d_(i,t){switch(t){case"heat":return re(i.heatExposure/100,0,1);case"flood":return re(i.floodExposure/100,0,1);case"air":return re(i.airPollution/100,0,1);case"uhi":return re(((i.uhiDeltaC??0)+7)/16,0,1);case"runoff":return re((i.runoffCoefficient??0)/.95,0,1);default:return}}class f_{constructor(t,e){ct(this,"root",new de);ct(this,"pickables",[]);ct(this,"scene");ct(this,"districtVisuals",new Map);ct(this,"waterMaterial");ct(this,"skyMaterial");ct(this,"hazeMaterial");ct(this,"haze");ct(this,"eventParticleMaterial");ct(this,"eventParticles");ct(this,"eventParticlePositions");ct(this,"eventLight");ct(this,"eventHalo");ct(this,"policyFx");ct(this,"policyScaffold");ct(this,"policyWorkers");ct(this,"policyWorkPad");ct(this,"hazardFx");ct(this,"hazardShockwave");ct(this,"hazardProps");ct(this,"policyCrane");ct(this,"policyCones");ct(this,"clockOffset",Math.random()*100);ct(this,"currentCue","civic");ct(this,"elapsedSeconds",0);ct(this,"eventPulse",0);ct(this,"policyFxStart",-100);ct(this,"hazardFxStart",-100);ct(this,"activePolicyCategory","governance");ct(this,"activeHazardCue","civic");ct(this,"policyShowConstruction",!0);ct(this,"seenPolicyKey","");ct(this,"seenResolutionKey","");ct(this,"seenChallengeId","");ct(this,"missionStarted",!1);ct(this,"dataLayerId","none");ct(this,"lastState");ct(this,"decor");ct(this,"tileFlashes",new Map);ct(this,"prevCellsKeys",new Map);this.scene=t,this.root.name="ClimateResilienceCityWorld",t.add(this.root),this.skyMaterial=this.createSkyDome(),this.createTaipeiBasinBackdrop(),this.createTerrain(),this.waterMaterial=this.createWater(),this.createRiverCorridor();for(let u=0;u<e.districts.length;u+=1){const h=this.createDistrict(e.districts[u],u);this.districtVisuals.set(e.districts[u].id,h),this.root.add(h.root)}const n=new Map;for(const[u,h]of this.districtVisuals)n.set(u,h.root.position.clone());this.decor=new l_(this.root,n);const{points:s,material:r}=this.createAtmosphere();this.haze=s,this.hazeMaterial=r,this.root.add(this.haze);const o=this.createEventParticles();this.eventParticles=o.points,this.eventParticleMaterial=o.material,this.eventParticlePositions=o.positions,this.root.add(this.eventParticles);const a=this.createEventFx();this.eventLight=a.light,this.eventHalo=a.halo,this.root.add(this.eventLight,this.eventHalo);const l=this.createPolicyFx();this.policyFx=l.fx,this.policyScaffold=l.scaffold,this.policyWorkers=l.workers,this.policyWorkPad=l.workPad,this.policyCrane=l.crane,this.policyCones=l.cones,this.root.add(this.policyFx.group);const c=this.createHazardFx();this.hazardFx=c.fx,this.hazardShockwave=c.shockwave,this.root.add(this.hazardFx.group),this.hazardProps=this.createHazardProps(),this.root.add(this.hazardProps.group),this.seenChallengeId=e.currentChallenge.id,this.seenPolicyKey=i_(e.appliedPolicies[0]),this.seenResolutionKey=s_(e),this.updateFromState(e)}setDataLayer(t){this.dataLayerId=t,this.lastState&&this.updateFromState(this.lastState)}updateFromState(t){this.lastState=t,this.currentCue=t.currentChallenge.soundCue;const e=Xa(this.currentCue);this.scene.background instanceof St?this.scene.background.setHex(e.background):this.scene.background=new St(e.background),this.scene.fog instanceof qr&&(this.scene.fog.color.setHex(e.fog),this.scene.fog.density=e.fogDensity+t.airQualityRisk/12e3),this.skyMaterial.uniforms.uSkyTop.value.setHex(e.skyTop),this.skyMaterial.uniforms.uSkyBottom.value.setHex(e.skyBottom),this.skyMaterial.uniforms.uAccent.value.setHex(e.skyAccent),this.waterMaterial.uniforms.uCueColor.value.setHex(e.waterGlow),this.waterMaterial.uniforms.uFlood.value=re(t.floodRisk/100,0,1);for(const s of t.districts){const r=this.districtVisuals.get(s.id);if(!r)continue;const o=d_(s,this.dataLayerId);if(o!==void 0)r.base.material.color.setHSL(.62-o*.62,.78,.34+o*.14),r.base.material.emissive.setHSL(.62-o*.62,.7,.1),r.base.material.emissiveIntensity=.35+o*.4;else{const u=Math.max(s.heatExposure,s.floodExposure,s.airPollution),h=Jv(Bc(s),13134406,re((u-42)/120,0,.38));r.base.material.color.setHex(h),r.base.material.emissive.setHex(s.heatExposure>70?3149832:463642),r.base.material.emissiveIntensity=s.heatExposure/160}r.buildingMaterial.color.setHSL(.56-s.airPollution/450,.42,.42),r.buildingMaterial.emissiveIntensity=s.solarCoverage*.18,r.windowMaterial.color.setHex(this.currentCue==="energy"?16773286:e.windowGlow),r.windowMaterial.opacity=re(.16+s.solarCoverage*.32+t.energySecurity/420-s.airPollution/520,.12,.78),r.streetMaterial.color.setHex(s.transitAccess>.58?e.street:5141632),r.streetMaterial.opacity=re(.2+s.transitAccess*.42,.22,.74);const a=this.dataLayerId==="none",l=this.prevCellsKeys.get(s.id),c=s.cells.join(",");r.cellTiles.forEach((u,h)=>{u.visible=a;const d=s.cells[h]??"pavement";u.material.color.setHex(Ka[d].color),l&&l.split(",")[h]!==d&&this.tileFlashes.set(u,this.elapsedSeconds)}),this.prevCellsKeys.set(s.id,c),r.waterOverlay.visible=!1,r.heatDome.visible=!1,r.selectedOutline.visible=s.id===t.selectedDistrictId,r.selectedOutline.material.opacity=s.id===t.selectedDistrictId?.92:0,r.root.position.y=s.id===t.selectedDistrictId?.16:0}this.hazeMaterial.opacity=re(t.airQualityRisk/330,.045,.28),this.hazeMaterial.size=t.currentChallenge.soundCue==="air"?.055:.035,this.hazeMaterial.color.setHex(e.particle);const n=Qv(this.currentCue);this.eventParticleMaterial.color.setHex(e.particle),this.eventParticleMaterial.size=n.size,this.eventParticleMaterial.opacity=n.opacity,this.eventLight.color.setHex(e.particle),this.eventHalo.material.color.setHex(e.particle),this.eventHalo.visible=!1,t.lastResolution&&(this.eventPulse=1),t.mission.status==="active"&&!this.missionStarted&&(this.triggerHazardFx(t.currentChallenge.soundCue),this.missionStarted=!0),this.decor.update(t,this.dataLayerId)}playYearTransition(t){const e=t.appliedPolicies.filter(s=>s.turn===t.turn).slice().reverse();e.forEach((s,r)=>{window.setTimeout(()=>this.triggerPolicyFx(s,t),260+r*720)});const n=Math.max(1200,680+e.length*720);window.setTimeout(()=>this.triggerHazardFx(t.currentChallenge.soundCue),n)}tick(t){this.elapsedSeconds=t,this.skyMaterial.uniforms.uTime.value=t,this.waterMaterial.uniforms.uTime.value=t,this.haze.rotation.y=Math.sin((t+this.clockOffset)*.08)*.06,this.haze.position.y=2.2+Math.sin(t*.42)*.12,this.decor.tick(t);for(const n of this.districtVisuals.values())n.selectedOutline.visible&&(n.selectedOutline.material.opacity=.55+Math.sin(t*3.2)*.35);for(const[n,s]of this.tileFlashes){const r=t-s,o=Math.max(0,1-r/1.4);o<=0?(n.material.emissiveIntensity=0,this.tileFlashes.delete(n)):(n.material.emissive.setHex(16774096),n.material.emissiveIntensity=o*1.4)}this.animateEventParticles(t),this.animatePolicyFx(t),this.animateHazardFx(t);const e=.5+Math.sin((t+this.clockOffset)*1.7)*.5;this.eventLight.intensity=.42+e*.18+this.eventPulse*2.1,this.eventHalo.material.opacity=.045+e*.028+this.eventPulse*.16,this.eventHalo.scale.setScalar(1+e*.05+this.eventPulse*.34),this.eventPulse=Math.max(0,this.eventPulse-.018)}findCellTarget(t){let e=t;for(;e;){if(typeof e.userData.cellIndex=="number"&&typeof e.userData.districtId=="string")return{districtId:e.userData.districtId,cellIndex:e.userData.cellIndex};e=e.parent}}findDistrictId(t){let e=t;for(;e;){if(typeof e.userData.districtId=="string")return e.userData.districtId;e=e.parent}}createTaipeiBasinBackdrop(){const t=new Kt({color:3108695,roughness:.94,metalness:.02,emissive:464655,emissiveIntensity:.08}),e=new Kt({color:1985602,roughness:.96,metalness:.01}),n=[[-10.2,-10.8,4.8,3.2],[-6.8,-12.1,6.2,4.5],[-2.3,-11.4,5.5,3.7],[2.6,-12.2,6.5,4.9],[7.2,-11.2,5.4,3.6],[10.6,-10.4,4.2,2.9]];for(const[a,l,c,u]of n){const h=new xt(new mi(c,u,5),t);h.position.set(a,u/2-.35,l),h.scale.z=.55,h.rotation.y=Math.PI/5,h.castShadow=!0,h.receiveShadow=!0,this.root.add(h)}const s=new xt(new qe(18,20,.18,7),new Kt({color:1784628,roughness:.9,metalness:.02,transparent:!0,opacity:.74}));s.position.set(0,-.36,-2.4),s.scale.set(1.2,1,.82),s.rotation.y=Math.PI/7,s.receiveShadow=!0,this.root.add(s);const r=new pn(new qt().setAttribute("position",new zt([-11.8,1.8,-10.2,-7.8,3.3,-11.6,-7.8,3.3,-11.6,-3.8,2.4,-10.8,-3.8,2.4,-10.8,1.4,3.8,-11.9,1.4,3.8,-11.9,6.2,2.6,-10.9,6.2,2.6,-10.9,11.7,1.7,-10.2],3)),new ln({color:9164452,transparent:!0,opacity:.26}));r.renderOrder=2,this.root.add(r);const o=new xt(new le(23,.22,3.8),e);o.position.set(0,-.22,-8.3),o.receiveShadow=!0,this.root.add(o)}createRiverCorridor(){const t=new Kt({color:1477284,roughness:.24,metalness:.06,transparent:!0,opacity:.76,emissive:539979,emissiveIntensity:.18}),e=new Ou([new C(-10.4,.02,5.8),new C(-6.6,.03,4.6),new C(-2.1,.03,4.9),new C(2.2,.03,3.9),new C(7.8,.03,4.7),new C(11.5,.03,6.2)]),n=new xt(new Io(e,90,.34,12,!1),t);n.rotation.x=0,n.receiveShadow=!0,this.root.add(n);const s=new Kt({color:11257789,roughness:.72,metalness:.16,emissive:1124901,emissiveIntensity:.08});for(const[r,o,a]of[[-5.2,4.7,-.28],[.8,4.4,-.16],[6,4.8,.22]]){const l=new xt(new le(1.9,.16,.34),s);l.position.set(r,.32,o),l.rotation.y=a,l.castShadow=!0,l.receiveShadow=!0,this.root.add(l)}}createSkyDome(){const t=new Le({side:Ue,depthWrite:!1,uniforms:{uTime:{value:0},uSkyTop:{value:new St(1192522)},uSkyBottom:{value:new St(661536)},uAccent:{value:new St(6740479)}},vertexShader:`
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
      `}),e=new xt(new gn(44,64,32),t);return e.name="ProceduralClimateSky",e.renderOrder=-20,this.scene.add(e),t}createTerrain(){const t=new Kt({color:2112311,map:r_(),roughness:.88,metalness:.04,emissive:266260,emissiveIntensity:.12}),e=new xt(new le(22.5,.25,18.8),t);e.position.set(0,-.26,-1.8),e.receiveShadow=!0,this.root.add(e)}createWater(){const t=new Le({transparent:!0,depthWrite:!1,uniforms:{uTime:{value:0},uCueColor:{value:new St(6018815)},uFlood:{value:.5}},vertexShader:`
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
      `}),e=new xt(new pi(23,8,96,28),t);return e.rotation.x=-Math.PI/2,e.position.set(0,-.08,7.4),e.receiveShadow=!0,this.root.add(e),t}createDistrict(t,e){const[n,s]=Kv[t.id]??[e*4,0],r=new de;r.position.set(n,0,s),r.userData.districtId=t.id;const o=new Kt({color:Bc(t),roughness:.78,metalness:.08,emissive:397332,emissiveIntensity:.08}),a=new xt(new le(5.2,.28,5.2),o);a.castShadow=!0,a.receiveShadow=!0,a.userData.districtId=t.id,r.add(a),this.pickables.push(a);const l=[],c=5.2/Qe;for(let x=0;x<Qe*Qe;x+=1){const T=x%Qe,P=Math.floor(x/Qe),w=new xt(new pi(c*.88,c*.88),new Kt({color:Ka[t.cells[x]??"pavement"].color,roughness:.85,metalness:.02,transparent:!0,opacity:.85}));w.rotation.x=-Math.PI/2,w.position.set((T-(Qe-1)/2)*c,.152,(P-(Qe-1)/2)*c),w.userData.districtId=t.id,w.userData.cellIndex=x,w.renderOrder=2,r.add(w),this.pickables.push(w),l.push(w)}if(t.archetype==="upland"){const x=this.createHillsideTerrain(e);x.userData.districtId=t.id,r.add(x)}const u=new Kt({color:6000291,roughness:.53,metalness:.18,emissive:1457224,emissiveIntensity:.08}),h=this.createBuildingCluster(t,u,e);h.userData.districtId=t.id,r.add(h),this.pickables.push(h);const d=this.createRooftopProps(t,e);if(d.userData.districtId=t.id,r.add(d),t.archetype==="industrial"){const x=this.createChimneys(e);x.userData.districtId=t.id,r.add(x)}if(t.archetype==="coastal"){const x=this.createContainers(e);x.userData.districtId=t.id,r.add(x)}if(t.id==="core"){const x=this.createTaipeiLandmark(u);x.userData.districtId=t.id,r.add(x),this.pickables.push(x)}const p=this.createWindowCluster(t,e);p.mesh.userData.districtId=t.id,r.add(p.mesh);const g=this.createStreetGrid(t,e);g.lines.userData.districtId=t.id,r.add(g.lines);const _=this.createCanopyCluster(t,e);_.userData.districtId=t.id,r.add(_);const m=new xt(new Po(3,48),new ke({color:3653112,transparent:!0,opacity:.2,depthWrite:!1}));m.rotation.x=-Math.PI/2,m.position.y=.17,m.visible=!1,m.userData.districtId=t.id,r.add(m);const f=new xt(new gn(3.2,36,18),new ke({color:16743229,transparent:!0,opacity:.08,depthWrite:!1,blending:we}));f.scale.y=.28,f.position.y=1.4,f.visible=!1,f.userData.districtId=t.id,r.add(f);const S=new pn(new qt().setAttribute("position",new zt([-2.72,.24,-2.72,2.72,.24,-2.72,2.72,.24,-2.72,2.72,.24,2.72,2.72,.24,2.72,-2.72,.24,2.72,-2.72,.24,2.72,-2.72,.24,-2.72],3)),new ln({color:9437138,transparent:!0,opacity:.92}));return S.visible=!1,r.add(S),{root:r,base:a,cellTiles:l,buildingMaterial:u,windowMaterial:p.material,streetMaterial:g.material,waterOverlay:m,heatDome:f,selectedOutline:S}}createHillsideTerrain(t){const e=new de,n=18,s=5.2,r=[],o=[];for(let h=0;h<=n;h+=1)for(let d=0;d<=n;d+=1){const p=-s/2+d/n*s,g=-s/2+h/n*s,_=po(p,g,t);r.push(p,_,g)}for(let h=0;h<n;h+=1)for(let d=0;d<n;d+=1){const p=h*(n+1)+d,g=p+1,_=p+n+1,m=_+1;o.push(p,_,g,g,_,m)}const a=new qt;a.setAttribute("position",new zt(r,3)),a.setIndex(o),a.computeVertexNormals();const l=new xt(a,new Kt({color:4164952,roughness:.9,metalness:.02,emissive:729876,emissiveIntensity:.06}));l.receiveShadow=!0,l.castShadow=!0,e.add(l);const c=[];for(let h=0;h<5;h+=1){const d=-2.05+h*.72,p=.4+h*.22;c.push(-2.15,p,d,2.15,p+.05,d+.12)}const u=new pn(new qt().setAttribute("position",new zt(c,3)),new ln({color:12050592,transparent:!0,opacity:.46}));return u.renderOrder=3,e.add(u),e}createTaipeiLandmark(t){const e=new de,n=t.clone();n.color.setHex(7317664),n.emissive.setHex(2052429),n.emissiveIntensity=.16;for(let o=0;o<7;o+=1){const a=.92-o*.055,l=new xt(new le(a,.7,a),n);l.position.set(-.7,2.1+o*.72,-.4),l.castShadow=!0,l.receiveShadow=!0,e.add(l)}const s=new xt(new le(1.1,1.2,1.1),n);s.position.set(-.7,.82,-.4),s.castShadow=!0,s.receiveShadow=!0,e.add(s);const r=new xt(new mi(.18,1.4,8),new Kt({color:13107187,emissive:7340008,emissiveIntensity:.28,roughness:.36,metalness:.34}));return r.position.set(-.7,7.8,-.4),r.castShadow=!0,e.add(r),e}createBuildingCluster(t,e,n){const s=wr(t),r=new cn(new le(1,1,1),e,s);r.castShadow=!0,r.receiveShadow=!0;const o=new ce,a=new St;for(let l=0;l<s;l+=1){const c=Wa(t,n,l);o.position.set(c.x,c.baseY+c.height/2,c.z),o.scale.set(c.scaleX,c.height,c.scaleZ),o.rotation.y=c.rotationY,o.updateMatrix(),r.setMatrixAt(l,o.matrix);const u=.82+mt(n*53+l*7)*.36;a.setRGB(u*(.95+mt(n*11+l)*.1),u,u*(.95+mt(n*29+l*3)*.12)),r.setColorAt(l,a)}return r.instanceMatrix.needsUpdate=!0,r.instanceColor&&(r.instanceColor.needsUpdate=!0),r}createRooftopProps(t,e){const n=wr(t),s=new cn(new qe(.07,.07,.16,8),new Kt({color:10135469,roughness:.6,metalness:.35}),n),r=new ce;let o=0;for(let a=0;a<n;a+=1){const l=Wa(t,e,a);l.height<1.1||mt(e*71+a*13)>.28||(r.position.set(l.x+(mt(e+a)-.5)*l.scaleX*.4,l.baseY+l.height+.08,l.z+(mt(e*3+a)-.5)*l.scaleZ*.4),r.rotation.set(0,0,0),r.scale.setScalar(.8+mt(e*5+a)*.5),r.updateMatrix(),s.setMatrixAt(o,r.matrix),o+=1)}return s.count=o,s.instanceMatrix.needsUpdate=!0,s}createChimneys(t){const e=new de,n=new Kt({color:9062970,roughness:.8}),s=new Kt({color:15262420,roughness:.6});for(let r=0;r<3;r+=1){const o=1.5+mt(t*17+r)*.9,a=-1.6+r*1.1+(mt(t+r)-.5)*.5,l=1.4+(mt(t*7+r)-.5)*1.2,c=new xt(new qe(.09,.13,o,8),n);c.position.set(a,.2+o/2,l),c.castShadow=!0;const u=new xt(new qe(.095,.1,.12,8),s);u.position.set(a,.2+o-.15,l),e.add(c,u)}return e}createContainers(t){const e=new de,n=[12737358,4161461,14263360,5217899];for(let a=0;a<10;a+=1){const l=new Kt({color:n[Math.floor(mt(t*13+a)*n.length)],roughness:.65,metalness:.2}),c=new xt(new le(.52,.2,.22),l),u=Math.floor(mt(t*31+a)*2);c.position.set(1.2+a%4*.58,.3+u*.21,1.5+Math.floor(a/4)*.3),c.rotation.y=(mt(t+a)-.5)*.08,c.castShadow=!0,e.add(c)}const s=new Kt({color:5078942,roughness:.5,metalness:.4}),r=new le(.07,1.5,.07);for(const[a,l]of[[-.3,0],[.3,0]]){const c=new xt(r,s);c.position.set(2+a,.95,1+l),e.add(c)}const o=new xt(new le(1.5,.08,.08),s);return o.position.set(2,1.7,1),o.rotation.z=-.12,e.add(o),e}createWindowCluster(t,e){const n=wr(t),s=t.archetype==="downtown"?12:t.archetype==="industrial"?4:6,r=new ke({color:16770984,transparent:!0,opacity:.42,depthWrite:!1,blending:we}),o=new cn(new le(.12,.085,.014),r,n*s*2);o.frustumCulled=!1;const a=new ce;let l=0;for(let c=0;c<n;c+=1){const u=Wa(t,e,c),h=Math.max(1,Math.min(s,Math.round(u.height*1.25)));for(let d=0;d<h;d+=1){const p=u.baseY+.2+u.height*(d+1)/(h+1),g=(mt(e*211+c*17+d)-.5)*.22;a.position.set(u.x+g,p,u.z+u.scaleZ*.51),a.rotation.set(0,u.rotationY,0),a.scale.setScalar(t.archetype==="industrial"?1.25:1),a.updateMatrix(),o.setMatrixAt(l,a.matrix),l+=1,a.position.set(u.x+u.scaleX*.51,p,u.z+g),a.rotation.set(0,u.rotationY+Math.PI/2,0),a.scale.setScalar(t.archetype==="industrial"?1.25:1),a.updateMatrix(),o.setMatrixAt(l,a.matrix),l+=1}}return o.count=l,o.instanceMatrix.needsUpdate=!0,{mesh:o,material:r}}createStreetGrid(t,e){const n=[],s=t.archetype==="downtown"?5:t.archetype==="upland"?3:4,r=2.5,o=.205;for(let u=0;u<s;u+=1){const h=u/(s-1),d=-r+h*r*2+(mt(e*81+u)-.5)*.16;n.push(-r,o,d,r,o,d),n.push(d,o,-r,d,o,r)}n.push(-r,o,-r,r,o,-r),n.push(r,o,-r,r,o,r),n.push(r,o,r,-r,o,r),n.push(-r,o,r,-r,o,-r);const a=new qt;a.setAttribute("position",new zt(n,3));const l=new ln({color:8775895,transparent:!0,opacity:.42,depthWrite:!1}),c=new pn(a,l);return c.renderOrder=3,{lines:c,material:l}}createCanopyCluster(t,e){const n=Math.max(4,Math.round(t.canopyCover*46)),s=new Kt({color:5752709,roughness:.72,metalness:.03,emissive:732440,emissiveIntensity:.04}),r=new cn(new mi(.25,.72,7),s,n);r.castShadow=!0,r.receiveShadow=!0;const o=new ce;for(let a=0;a<n;a+=1){const l=mt(e*99+a)*Math.PI*2,c=1.2+mt(e*11+a)*1.5,u=Math.cos(l)*c,h=Math.sin(l)*c,d=t.archetype==="upland"?po(u,h,e)+.5:.62;o.position.set(u,d,h),o.scale.setScalar(.72+mt(e*42+a)*.5),o.rotation.y=l,o.updateMatrix(),r.setMatrixAt(a,o.matrix)}return r.instanceMatrix.needsUpdate=!0,r}createAtmosphere(){const e=new Float32Array(2700);for(let r=0;r<900;r+=1)e[r*3]=(Math.random()-.5)*24,e[r*3+1]=.8+Math.random()*4.2,e[r*3+2]=(Math.random()-.5)*20;const n=new qt;n.setAttribute("position",new Pe(e,3));const s=new bs({color:13934939,size:.035,transparent:!0,opacity:.12,depthWrite:!1,blending:we});return{points:new vr(n,s),material:s}}createEventParticles(){const e=new Float32Array(2280);for(let o=0;o<760;o+=1)$a(e,o,this.currentCue);const n=new qt;n.setAttribute("position",new Pe(e,3));const s=new bs({color:9437138,size:.04,transparent:!0,opacity:.22,depthWrite:!1,blending:we}),r=new vr(n,s);return r.frustumCulled=!1,r.renderOrder=4,{points:r,material:s,positions:e}}animateEventParticles(t){const e=this.eventParticlePositions,n=e.length/3,s=this.currentCue;for(let o=0;o<n;o+=1){const a=o*3,l=Math.sin(t*.6+o*.37)*.006;s==="rain"?(e[a]+=l,e[a+1]-=.052+mt(o*19)*.034,e[a+2]+=.01,e[a+1]<.08&&$a(e,o,s,6.8)):s==="heat"?(e[a]+=l*.8,e[a+1]+=.012+mt(o*13)*.012,e[a+2]+=Math.sin(t*.9+o)*.003,e[a+1]>5.8&&$a(e,o,s,.32)):s==="air"?(e[a]+=.012+mt(o*7)*.012,e[a+1]+=Math.sin(t+o)*.002,e[a+2]+=l,e[a]>12&&(e[a]=-12,e[a+1]=.9+Math.random()*3.6,e[a+2]=(Math.random()-.5)*18)):s==="energy"?(e[a]+=Math.sin(t*2.4+o)*.006,e[a+1]+=Math.sin(t*3.2+o*.25)*.004,e[a+2]+=Math.cos(t*2.1+o)*.006):(e[a]+=l*.55,e[a+1]+=Math.sin(t*.72+o)*.002)}const r=this.eventParticles.geometry.getAttribute("position");r.needsUpdate=!0,this.eventParticles.rotation.y=Math.sin(t*.09)*.045}createPolicyFx(){const t=new de;t.visible=!1;const e=340,n=new Float32Array(e*3);for(let d=0;d<e;d+=1)mn(n,d,"governance");const s=new qt;s.setAttribute("position",new Pe(n,3));const r=new bs({color:9437138,size:.085,transparent:!0,opacity:0,depthWrite:!1,blending:we}),o=new vr(s,r);o.frustumCulled=!1,t.add(o);const a=new pn(new qt().setAttribute("position",new zt([-1.9,.25,-1.4,-1.9,2.4,-1.4,-1.9,2.4,-1.4,.9,2.4,-1.4,.9,2.4,-1.4,1.35,1.85,-1.4,-1.9,.95,-1.4,.9,2.4,-1.4,-1.9,1.62,-1.4,-.45,.25,-1.4,1.4,.25,1.35,1.4,1.55,1.35,.6,1.55,1.35,2,1.55,1.35,.6,1.55,1.35,1.4,.25,1.35,2,1.55,1.35,1.4,.25,1.35],3)),new ln({color:16766815,transparent:!0,opacity:0}));a.renderOrder=5,t.add(a);const l=new xt(new pi(3,2.15),new ke({color:16766815,transparent:!0,opacity:0,depthWrite:!1,side:je}));l.rotation.x=-Math.PI/2,l.position.y=.08,l.renderOrder=4,t.add(l);const c=this.createPolicyWorkers();t.add(c);const u=this.createPolicyCrane();t.add(u);const h=this.createTrafficCones();return t.add(h),{fx:{group:t,points:o,material:r,positions:n},scaffold:a,workers:c,workPad:l,crane:u,cones:h}}createPolicyCrane(){const t=new de,e=new Kt({color:16761405,roughness:.5,metalness:.35,emissive:3351306,emissiveIntensity:.18}),n=new xt(new le(.5,.12,.5),e);n.position.y=.06;const s=new xt(new qe(.055,.07,2.6,6),e);s.position.y=1.42,t.add(n,s);const r=new de;r.position.y=2.74;const o=new xt(new le(1.95,.07,.07),e);o.position.x=.78;const a=new xt(new le(.6,.09,.09),e);a.position.x=-.42;const l=new xt(new le(.16,.2,.16),e);l.position.set(-.66,-.08,0);const c=new qt().setAttribute("position",new zt([0,.34,0,1.68,.02,0,0,.34,0,-.6,.02,0],3)),u=new pn(c,new ln({color:14211288,transparent:!0,opacity:.85})),h=new xt(new qe(.008,.008,1,4),e);h.position.set(1.55,-.5,0);const d=new xt(new le(.12,.12,.12),e);return d.position.set(1.55,-1.05,0),r.add(o,a,l,u,h,d),r.userData.cable=h,r.userData.hook=d,t.add(r),t.userData.jib=r,t.position.set(1.95,.1,-.7),t}createTrafficCones(){const t=new de,e=new Kt({color:16738858,roughness:.6,emissive:5576451,emissiveIntensity:.32}),n=new Kt({color:15921906,roughness:.5,emissive:4210752,emissiveIntensity:.25});for(let s=0;s<8;s+=1){const r=new de,o=new xt(new qe(.016,.085,.2,8),e);o.position.y=.1;const a=new xt(new qe(.045,.058,.035,8),n);a.position.y=.11,r.add(o,a);const l=s/8*Math.PI*2+.32,c=1.7+mt(s*23)*.5;r.position.set(Math.cos(l)*c,.02,Math.sin(l)*c),t.add(r)}return t}createPolicyWorkers(){const t=new de,e=new Kt({color:16766815,roughness:.62,metalness:.08,emissive:3809544,emissiveIntensity:.14}),n=new Kt({color:16773258,roughness:.46,metalness:.1,emissive:4863238,emissiveIntensity:.16});for(let l=0;l<10;l+=1){const c=new de,u=new xt(new qe(.085,.105,.34,8),e),h=new xt(new gn(.105,10,8),n);u.position.y=.2,h.position.y=.42,c.add(u,h);const d=l/10*Math.PI*2,p=.9+mt(l*31)*1.45;c.position.set(Math.cos(d)*p,.16,Math.sin(d)*p),c.rotation.y=-d,c.userData.phase=mt(l*19)*Math.PI*2,t.add(c)}const s=new Kt({color:16758861,roughness:.54,metalness:.16,emissive:3808261,emissiveIntensity:.12}),r=new de,o=new xt(new le(.62,.24,.32),s),a=new xt(new le(.3,.3,.32),s);return o.position.set(0,.22,0),a.position.set(.42,.26,0),r.add(o,a),r.position.set(-1.75,.18,1.55),r.userData.phase=0,t.add(r),t}createHazardFx(){const t=new de;t.visible=!1;const e=680,n=new Float32Array(e*3);for(let l=0;l<e;l+=1)Xi(n,l,"civic");const s=new qt;s.setAttribute("position",new Pe(n,3));const r=new bs({color:16747082,size:.075,transparent:!0,opacity:0,depthWrite:!1,blending:we}),o=new vr(s,r);o.frustumCulled=!1,o.renderOrder=6,t.add(o);const a=new xt(new ws(.7,.96,96),new ke({color:16747082,transparent:!0,opacity:0,depthWrite:!1,blending:we,side:je}));return a.rotation.x=-Math.PI/2,a.position.y=.24,a.renderOrder=7,t.add(a),{fx:{group:t,points:o,material:r,positions:n},shockwave:a}}triggerPolicyFx(t,e){var u;const n=_o(t.policyId),s=(n==null?void 0:n.category)??"governance",r=t.targetDistrictId??e.selectedDistrictId,o=((u=this.districtVisuals.get(r))==null?void 0:u.root.position)??new C(0,0,-1.2),a=n_(r,o),l=t_(s);this.activePolicyCategory=s,this.policyFx.group.visible=!0,this.policyFx.group.position.set(a.x,.12,a.z),this.policyFx.group.scale.setScalar((n==null?void 0:n.target)==="city"?1.55:1),this.policyFx.material.color.setHex(l);const c=s==="flood"||s==="energy"||s==="mobility"||s==="industry"||s==="governance";this.policyShowConstruction=c,this.policyScaffold.visible=c,this.policyWorkers.visible=c,this.policyScaffold.material.color.setHex(l),this.policyWorkPad.material.color.setHex(l),this.tintPolicyWorkers(l),this.policyFxStart=this.elapsedSeconds;for(let h=0;h<this.policyFx.positions.length/3;h+=1)mn(this.policyFx.positions,h,s);this.policyFx.points.geometry.getAttribute("position").needsUpdate=!0}createHazardProps(){const t=new de;t.visible=!1;const e=new xt(new gn(1.25,24,18),new ke({color:16742954,transparent:!0,opacity:0}));e.position.set(3.6,6.6,-3.4),e.renderOrder=8,t.add(e);const n=new xt(new gn(2,20,16),new ke({color:16757322,transparent:!0,opacity:0,blending:we,depthWrite:!1}));n.position.copy(e.position),t.add(n);const s=[];for(let S=0;S<12;S+=1){const x=S/12*Math.PI*2,T=1.45,P=2.3+mt(S*7)*.7;s.push(Math.cos(x)*T,Math.sin(x)*T,0),s.push(Math.cos(x)*P,Math.sin(x)*P,0)}const r=new pn(new qt().setAttribute("position",new zt(s,3)),new ln({color:16764778,transparent:!0,opacity:0,blending:we}));r.position.copy(e.position),r.renderOrder=8,t.add(r);const o=new xt(new ws(2.4,4.8,64),new ke({color:16756848,transparent:!0,opacity:0,depthWrite:!1,blending:we,side:je}));o.rotation.x=-Math.PI/2,o.position.y=.32,o.renderOrder=7,t.add(o);const a=new de,l=new Kt({color:3752527,roughness:1,metalness:0,transparent:!0,opacity:0,emissive:10470655,emissiveIntensity:0});for(const[S,x,T]of[[-1,0,.95],[.1,.25,1.2],[1.1,-.1,.92],[.25,-.55,.82]]){const P=new xt(new gn(T,16,12),l);P.position.set(S,0,x),P.scale.y=.6,a.add(P)}a.position.set(0,5.6,-1),t.add(a);const c=new pn(this.makeBoltGeometry(),new ln({color:13954303,transparent:!0,opacity:0,blending:we}));c.position.set(0,4.9,-1),c.renderOrder=8,t.add(c);const u=320,h=new Float32Array(u*6),d=new Float32Array(u);for(let S=0;S<u;S+=1)this.respawnRainStreak(h,d,S,!0);const p=new pn(new qt().setAttribute("position",new Pe(h,3)),new ln({color:11982058,transparent:!0,opacity:0,blending:we}));p.frustumCulled=!1,p.renderOrder=7,p.userData.positions=h,p.userData.speeds=d,t.add(p);const g=new de;for(let S=0;S<14;S+=1){const x=new xt(new ws(.05,.085,18),new ke({color:13625077,transparent:!0,opacity:0,depthWrite:!1,blending:we,side:je}));x.rotation.x=-Math.PI/2,x.position.set((mt(S*13)-.5)*9,.1,(mt(S*29)-.5)*9),x.userData.phase=S/14,g.add(x)}g.renderOrder=7,t.add(g);const _=new de,m=new Kt({color:9207139,roughness:1,transparent:!0,opacity:0});[[-1.5,.2,0,1],[-.2,.7,.3,1.35],[1.2,.3,-.2,1.05],[.3,1.2,.1,.9]].forEach(([S,x,T,P],w)=>{const A=new xt(new gn(P,14,10),m);A.position.set(S,x,T),A.userData.base=new C(S,x,T),A.userData.phase=w*1.7,_.add(A)}),_.position.set(0,3.3,-1),t.add(_);const f=new pn(this.makeSparkGeometry(),new ln({color:16770689,transparent:!0,opacity:0,blending:we}));return f.position.set(0,2.6,-1),f.renderOrder=8,t.add(f),{group:t,sun:e,corona:n,sunRays:r,mirage:o,cloud:a,bolt:c,rain:p,splashes:g,smog:_,spark:f}}respawnRainStreak(t,e,n,s=!1){const r=n*6,o=(mt(n*7+1)-.5)*13+(Math.random()-.5)*4,a=(mt(n*11+3)-.5)*13+(Math.random()-.5)*4,l=s?1+Math.random()*6:6+Math.random()*1.5,c=.32+Math.random()*.22,u=.07,h=.16;t[r]=o,t[r+1]=l,t[r+2]=a,t[r+3]=o-u*c*6,t[r+4]=l+c,t[r+5]=a-h*c*6,e[n]=.16+Math.random()*.1}makeBoltGeometry(){const t=[];let e=0,n=0;for(let s=1;s<=9;s+=1){const r=(Math.random()-.5)*1.3,o=-s*.4;t.push(e,n,0,r,o,0),e=r,n=o}return new qt().setAttribute("position",new zt(t,3))}makeSparkGeometry(){const t=[];for(let e=0;e<7;e+=1){const n=e/7*Math.PI*2;let s=0,r=0,o=0;for(let a=1;a<=4;a+=1){const l=a*.62,c=Math.cos(n)*l+(Math.random()-.5)*.34,u=Math.sin(n)*l+(Math.random()-.5)*.34,h=(Math.random()-.5)*.45;t.push(s,r,o,c,h,u),s=c,r=h,o=u}}return new qt().setAttribute("position",new zt(t,3))}updateHazardProps(t,e,n){const s=this.hazardProps;if(s.group.visible=!0,s.sun.visible=s.corona.visible=s.sunRays.visible=s.mirage.visible=t==="heat",s.cloud.visible=s.bolt.visible=s.rain.visible=s.splashes.visible=t==="rain",s.smog.visible=t==="air",s.spark.visible=t==="energy",t==="heat"){const r=.5+Math.sin(n*4)*.5;s.sun.material.opacity=.95*e,s.corona.material.opacity=(.28+r*.3)*e,s.sun.scale.setScalar(1+r*.08),s.corona.scale.setScalar(1+r*.16),s.sun.position.y=6.6+Math.sin(n*1.3)*.12,s.corona.position.copy(s.sun.position),s.sunRays.position.copy(s.sun.position),s.sunRays.rotation.z=n*.18,s.sunRays.material.opacity=(.32+r*.3)*e;const o=.5+Math.sin(n*2.6)*.5;s.mirage.scale.setScalar(1+o*.12+Math.sin(n*5.1)*.03),s.mirage.material.opacity=(.05+o*.07)*e}else if(t==="rain"){const r=.9*e,o=Math.sin(n*7.5)>.86?1:0;s.cloud.traverse(c=>{const u=c.material;if(u&&"opacity"in u){const h=u;h.opacity=r,h.emissiveIntensity=o*1.5+Math.max(0,Math.sin(n*3.3))*.06}}),s.cloud.position.y=5.6+Math.sin(n*1.5)*.16,s.cloud.position.x=Math.sin(n*.3)*.5,s.bolt.material.opacity=o*e,o>0&&(s.bolt.geometry.copy(this.makeBoltGeometry()),this.eventPulse=Math.max(this.eventPulse,.42));const a=s.rain.userData.positions,l=s.rain.userData.speeds;for(let c=0;c<l.length;c+=1){const u=c*6,h=l[c];a[u+1]-=h,a[u+4]-=h,a[u]+=h*.42,a[u+3]+=h*.42,a[u+2]+=h*.94,a[u+5]+=h*.94,a[u+1]<.1&&this.respawnRainStreak(a,l,c)}s.rain.geometry.getAttribute("position").needsUpdate=!0,s.rain.material.opacity=.55*e,s.splashes.children.forEach(c=>{const u=c,h=(n*1.7+u.userData.phase)%1;h<(u.userData.lastPhase??1)&&u.position.set((Math.random()-.5)*10,.1,(Math.random()-.5)*10),u.userData.lastPhase=h,u.scale.setScalar(.3+h*2.6),u.material.opacity=Math.max(0,(1-h)*.5)*e})}else if(t==="air"){const r=.62*e;s.smog.children.forEach(o=>{const a=o,l=a.material,c=a.userData.base,u=a.userData.phase;l.opacity=r*(1.15-c.y*.28),a.scale.setScalar(1+Math.sin(n*.6+u)*.14),a.position.set(c.x+Math.sin(n*.24+u)*.5,c.y+Math.sin(n*.4+u*2)*.12,c.z+Math.cos(n*.19+u)*.4)}),s.smog.rotation.y=n*.1,s.smog.position.y=3.3+Math.sin(n*.8)*.12,s.smog.position.x=Math.sin(n*.12)*.9}else if(t==="energy"){const r=Math.sin(n*24)>0?1:.22;s.spark.material.opacity=r*e,s.spark.rotation.y=n*3.2,Math.sin(n*24)>.96&&(s.spark.geometry.copy(this.makeSparkGeometry()),this.eventPulse=Math.max(this.eventPulse,.3))}else s.group.visible=!1}tintPolicyWorkers(t){this.policyWorkers.traverse(e=>{const n=e;if(n.isMesh){const s=n.material;s&&s.color&&s.color.setHex(t)}})}triggerHazardFx(t){this.activeHazardCue=t,this.hazardFx.group.visible=!0,this.hazardFx.group.position.copy(e_(t)),this.hazardFx.material.color.setHex(Xa(t).particle),this.hazardFx.material.size=t==="rain"?.07:t==="air"?.13:t==="heat"?.1:t==="energy"?.075:.08,this.hazardShockwave.material.color.setHex(Xa(t).particle),this.hazardShockwave.visible=!0,this.hazardShockwave.scale.setScalar(.4),this.hazardFxStart=this.elapsedSeconds;for(let e=0;e<this.hazardFx.positions.length/3;e+=1)Xi(this.hazardFx.positions,e,t);this.hazardFx.points.geometry.getAttribute("position").needsUpdate=!0}animatePolicyFx(t){const e=t-this.policyFxStart;if(e<0||e>2.9){this.policyFx.group.visible=!1,this.policyFx.material.opacity=0,this.policyScaffold.material.opacity=0,this.policyWorkers.visible=!1,this.policyCrane.visible=!1,this.policyCones.visible=!1,this.policyWorkPad.material.opacity=0;return}const n=re(e/2.9,0,1),s=Math.sin(n*Math.PI),r=this.activePolicyCategory,o=this.policyShowConstruction,a=this.policyFx.positions;this.policyFx.material.opacity=.92*s,this.policyScaffold.material.opacity=o?.86*s:0,this.policyWorkPad.material.opacity=o?.26*s:0,this.policyWorkPad.scale.set(1+Math.sin(t*5.5)*.025,1,1+Math.cos(t*4.5)*.025);const c=Math.max(2,2*Math.ceil(re(e/1.75,0,1)*(18/2)));if(this.policyScaffold.geometry.setDrawRange(0,c),this.policyWorkers.visible=o&&s>.04,this.policyCrane.visible=o&&s>.04,this.policyCones.visible=o&&s>.04,o){this.policyWorkers.children.forEach((_,m)=>{const f=typeof _.userData.phase=="number"?_.userData.phase:0;if(m===this.policyWorkers.children.length-1){const x=Math.sin(t*.75);_.position.x=-1.75+x*1.1,_.position.y=.18,_.rotation.y=Math.cos(t*.75)>=0?0:Math.PI}else _.position.y=.16+Math.abs(Math.sin(t*7.5+f))*.08,_.rotation.y+=Math.sin(t*4+f)*.012});const u=this.policyCrane.userData.jib;u.rotation.y=t*.55;const h=u.userData.hook,d=u.userData.cable,p=-1.05+Math.sin(t*1.3)*.32;h.position.y=p;const g=Math.max(.2,-p-.03);d.scale.y=g,d.position.y=p/2}for(let u=0;u<a.length/3;u+=1){const h=u*3,d=a[h],p=a[h+2];if(r==="flood")a[h]+=Math.sin(t*3+u)*.008,a[h+1]=.16+Math.sin(t*5+u)*.03,a[h+2]+=.03,a[h+2]>2.9&&mn(a,u,r);else if(r==="energy")a[h+1]+=.034+mt(u*11)*.024,a[h]+=Math.sin(t*6+u)*.014,a[h+1]>4.8&&mn(a,u,r);else if(r==="cooling")a[h+1]-=.024+mt(u*9)*.014,a[h]+=Math.sin(t*2+u)*.007,a[h+1]<.08&&mn(a,u,r);else if(r==="mobility"){const g=Math.atan2(p,d);a[h]+=Math.cos(g)*.034,a[h+2]+=Math.sin(g)*.034,a[h+1]=.12+Math.sin(t*7+u)*.03,Math.hypot(a[h],a[h+2])>3.5&&mn(a,u,r)}else if(r==="health")a[h+1]+=.02+Math.abs(Math.sin(t*3+u))*.012,a[h]+=Math.sin(t*2.4+u)*.006,a[h+2]+=Math.cos(t*2.4+u)*.006,a[h+1]>3.2&&mn(a,u,r);else if(r==="biodiversity"){const g=Math.atan2(p,d);a[h]+=Math.cos(g)*.014,a[h+2]+=Math.sin(g)*.014,a[h+1]+=.012+mt(u*5)*.008,a[h+1]>2.4&&mn(a,u,r)}else r==="industry"?(a[h+1]+=.026,a[h]+=.008+Math.sin(t*1.5+u)*.016,a[h+1]>3.8&&mn(a,u,r)):(a[h+1]+=.03,a[h+1]>3.6&&mn(a,u,r))}this.policyFx.points.geometry.getAttribute("position").needsUpdate=!0}animateHazardFx(t){const e=t-this.hazardFxStart;if(e<0||e>3.6){this.hazardFx.group.visible=!1,this.hazardFx.material.opacity=0,this.hazardShockwave.visible=!1,this.hazardShockwave.material.opacity=0,this.hazardProps.group.visible=!1;return}const n=re(e/3.6,0,1),s=Math.sin(n*Math.PI),r=this.activeHazardCue,o=this.hazardFx.positions;this.hazardFx.material.opacity=(r==="air"?.72:.9)*s,this.updateHazardProps(r,s,t);const a=this.hazardShockwave;if(a.visible=!0,r==="rain")a.scale.setScalar(.35+n*9.6),a.material.opacity=Math.max(0,.62*(1-n)),a.rotation.z=0;else if(r==="heat"){const l=.5+Math.sin(t*6.5)*.5;a.scale.setScalar(.7+n*4.6+l*.6),a.material.opacity=Math.max(0,(.45+l*.4)*(1-n*.65)),a.rotation.z=t*.25}else if(r==="air")a.scale.setScalar(.6+n*11.5),a.material.opacity=Math.max(0,.3*(1-n)),a.rotation.z=t*.12;else if(r==="energy"){const l=Math.sin(t*34)>-.2?1:.25;a.scale.setScalar(.4+n*7.2+Math.sin(t*20)*.35),a.material.opacity=Math.max(0,.9*l*(1-n)),a.rotation.z=t*2.6}else a.scale.setScalar(.4+n*5),a.material.opacity=Math.max(0,.5*(1-n)),a.rotation.z=t*.35;for(let l=0;l<o.length/3;l+=1){const c=l*3;r==="rain"?(o[c]+=.022,o[c+1]-=.17+mt(l*5)*.09,o[c+2]+=.05,o[c+1]<.08&&Xi(o,l,r)):r==="heat"?(o[c+1]+=.06+mt(l*7)*.045,o[c]+=Math.sin(t*4.2+l)*.03,o[c+2]+=Math.cos(t*3.1+l)*.02,o[c+1]>6.4&&Xi(o,l,r)):r==="air"?(o[c]+=.058+mt(l*17)*.03,o[c+1]+=Math.sin(t*1.2+l)*.014,o[c+2]+=Math.sin(t*.8+l)*.02,o[c]>7.6&&Xi(o,l,r)):r==="energy"?(o[c]+=(mt(l*3+Math.floor(t*22))-.5)*.11,o[c+1]+=(mt(l*7+Math.floor(t*22))-.5)*.11,o[c+2]+=(mt(l*13+Math.floor(t*22))-.5)*.11,Math.hypot(o[c],o[c+2])>5.2&&Xi(o,l,r)):(o[c+1]+=.02,o[c]+=Math.sin(t*3+l)*.012)}this.hazardFx.points.geometry.getAttribute("position").needsUpdate=!0}createEventFx(){const t=new zu(16757087,.8,24,1.7);t.position.set(0,7.5,1.2);const e=new xt(new gn(8.2,48,24),new ke({color:16757087,transparent:!0,opacity:.08,depthWrite:!1,blending:we,side:Ue}));return e.position.set(0,2.4,-.8),e.scale.y=.46,{light:t,halo:e}}}const Hu={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

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


		}`};class us{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const p_=new Xr(-1,1,1,-1,0,1);class m_ extends qt{constructor(){super(),this.setAttribute("position",new zt([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new zt([0,2,0,0,2,0],2))}}const g_=new m_;class No{constructor(t){this._mesh=new xt(g_,t)}dispose(){this._mesh.geometry.dispose()}render(t){t.render(this._mesh,p_)}get material(){return this._mesh.material}set material(t){this._mesh.material=t}}class Gu extends us{constructor(t,e){super(),this.textureID=e!==void 0?e:"tDiffuse",t instanceof Le?(this.uniforms=t.uniforms,this.material=t):t&&(this.uniforms=Ds.clone(t.uniforms),this.material=new Le({name:t.name!==void 0?t.name:"unspecified",defines:Object.assign({},t.defines),uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader})),this.fsQuad=new No(this.material)}render(t,e,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this.fsQuad.material=this.material,this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this.fsQuad.render(t))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}class Hc extends us{constructor(t,e){super(),this.scene=t,this.camera=e,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(t,e,n){const s=t.getContext(),r=t.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let o,a;this.inverse?(o=0,a=1):(o=1,a=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(s.REPLACE,s.REPLACE,s.REPLACE),r.buffers.stencil.setFunc(s.ALWAYS,o,4294967295),r.buffers.stencil.setClear(a),r.buffers.stencil.setLocked(!0),t.setRenderTarget(n),this.clear&&t.clear(),t.render(this.scene,this.camera),t.setRenderTarget(e),this.clear&&t.clear(),t.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(s.EQUAL,1,4294967295),r.buffers.stencil.setOp(s.KEEP,s.KEEP,s.KEEP),r.buffers.stencil.setLocked(!0)}}class v_ extends us{constructor(){super(),this.needsSwap=!1}render(t){t.state.buffers.stencil.setLocked(!1),t.state.buffers.stencil.setTest(!1)}}class __{constructor(t,e){if(this.renderer=t,this._pixelRatio=t.getPixelRatio(),e===void 0){const n=t.getSize(new tt);this._width=n.width,this._height=n.height,e=new dn(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:$n}),e.texture.name="EffectComposer.rt1"}else this._width=e.width,this._height=e.height;this.renderTarget1=e,this.renderTarget2=e.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Gu(Hu),this.copyPass.material.blending=Dn,this.clock=new ku}swapBuffers(){const t=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=t}addPass(t){this.passes.push(t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(t,e){this.passes.splice(e,0,t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(t){const e=this.passes.indexOf(t);e!==-1&&this.passes.splice(e,1)}isLastEnabledPass(t){for(let e=t+1;e<this.passes.length;e++)if(this.passes[e].enabled)return!1;return!0}render(t){t===void 0&&(t=this.clock.getDelta());const e=this.renderer.getRenderTarget();let n=!1;for(let s=0,r=this.passes.length;s<r;s++){const o=this.passes[s];if(o.enabled!==!1){if(o.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(s),o.render(this.renderer,this.writeBuffer,this.readBuffer,t,n),o.needsSwap){if(n){const a=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(a.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,t),l.setFunc(a.EQUAL,1,4294967295)}this.swapBuffers()}Hc!==void 0&&(o instanceof Hc?n=!0:o instanceof v_&&(n=!1))}}this.renderer.setRenderTarget(e)}reset(t){if(t===void 0){const e=this.renderer.getSize(new tt);this._pixelRatio=this.renderer.getPixelRatio(),this._width=e.width,this._height=e.height,t=this.renderTarget1.clone(),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=t,this.renderTarget2=t.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(t,e){this._width=t,this._height=e;const n=this._width*this._pixelRatio,s=this._height*this._pixelRatio;this.renderTarget1.setSize(n,s),this.renderTarget2.setSize(n,s);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(n,s)}setPixelRatio(t){this._pixelRatio=t,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}const x_={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
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

		}`};class y_ extends us{constructor(){super();const t=x_;this.uniforms=Ds.clone(t.uniforms),this.material=new Vv({name:t.name,uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader}),this.fsQuad=new No(this.material),this._outputColorSpace=null,this._toneMapping=null}render(t,e,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=t.toneMappingExposure,(this._outputColorSpace!==t.outputColorSpace||this._toneMapping!==t.toneMapping)&&(this._outputColorSpace=t.outputColorSpace,this._toneMapping=t.toneMapping,this.material.defines={},te.getTransfer(this._outputColorSpace)===oe&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===iu?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===su?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===ru?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===bo?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===au?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===ou&&(this.material.defines.NEUTRAL_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this.fsQuad.render(t))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}class M_ extends us{constructor(t,e,n=null,s=null,r=null){super(),this.scene=t,this.camera=e,this.overrideMaterial=n,this.clearColor=s,this.clearAlpha=r,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new St}render(t,e,n){const s=t.autoClear;t.autoClear=!1;let r,o;this.overrideMaterial!==null&&(o=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(t.getClearColor(this._oldClearColor),t.setClearColor(this.clearColor,t.getClearAlpha())),this.clearAlpha!==null&&(r=t.getClearAlpha(),t.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&t.clearDepth(),t.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),t.render(this.scene,this.camera),this.clearColor!==null&&t.setClearColor(this._oldClearColor),this.clearAlpha!==null&&t.setClearAlpha(r),this.overrideMaterial!==null&&(this.scene.overrideMaterial=o),t.autoClear=s}}const S_={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new St(0)},defaultOpacity:{value:0}},vertexShader:`

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

		}`};class ls extends us{constructor(t,e,n,s){super(),this.strength=e!==void 0?e:1,this.radius=n,this.threshold=s,this.resolution=t!==void 0?new tt(t.x,t.y):new tt(256,256),this.clearColor=new St(0,0,0),this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let r=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);this.renderTargetBright=new dn(r,o,{type:$n}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let h=0;h<this.nMips;h++){const d=new dn(r,o,{type:$n});d.texture.name="UnrealBloomPass.h"+h,d.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(d);const p=new dn(r,o,{type:$n});p.texture.name="UnrealBloomPass.v"+h,p.texture.generateMipmaps=!1,this.renderTargetsVertical.push(p),r=Math.round(r/2),o=Math.round(o/2)}const a=S_;this.highPassUniforms=Ds.clone(a.uniforms),this.highPassUniforms.luminosityThreshold.value=s,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new Le({uniforms:this.highPassUniforms,vertexShader:a.vertexShader,fragmentShader:a.fragmentShader}),this.separableBlurMaterials=[];const l=[3,5,7,9,11];r=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);for(let h=0;h<this.nMips;h++)this.separableBlurMaterials.push(this.getSeperableBlurMaterial(l[h])),this.separableBlurMaterials[h].uniforms.invSize.value=new tt(1/r,1/o),r=Math.round(r/2),o=Math.round(o/2);this.compositeMaterial=this.getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=e,this.compositeMaterial.uniforms.bloomRadius.value=.1;const c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new C(1,1,1),new C(1,1,1),new C(1,1,1),new C(1,1,1),new C(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors;const u=Hu;this.copyUniforms=Ds.clone(u.uniforms),this.blendMaterial=new Le({uniforms:this.copyUniforms,vertexShader:u.vertexShader,fragmentShader:u.fragmentShader,blending:we,depthTest:!1,depthWrite:!1,transparent:!0}),this.enabled=!0,this.needsSwap=!1,this._oldClearColor=new St,this.oldClearAlpha=1,this.basic=new ke,this.fsQuad=new No(null)}dispose(){for(let t=0;t<this.renderTargetsHorizontal.length;t++)this.renderTargetsHorizontal[t].dispose();for(let t=0;t<this.renderTargetsVertical.length;t++)this.renderTargetsVertical[t].dispose();this.renderTargetBright.dispose();for(let t=0;t<this.separableBlurMaterials.length;t++)this.separableBlurMaterials[t].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this.basic.dispose(),this.fsQuad.dispose()}setSize(t,e){let n=Math.round(t/2),s=Math.round(e/2);this.renderTargetBright.setSize(n,s);for(let r=0;r<this.nMips;r++)this.renderTargetsHorizontal[r].setSize(n,s),this.renderTargetsVertical[r].setSize(n,s),this.separableBlurMaterials[r].uniforms.invSize.value=new tt(1/n,1/s),n=Math.round(n/2),s=Math.round(s/2)}render(t,e,n,s,r){t.getClearColor(this._oldClearColor),this.oldClearAlpha=t.getClearAlpha();const o=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),r&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this.fsQuad.material=this.basic,this.basic.map=n.texture,t.setRenderTarget(null),t.clear(),this.fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=n.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this.fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this.fsQuad.render(t);let a=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this.fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=a.texture,this.separableBlurMaterials[l].uniforms.direction.value=ls.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[l]),t.clear(),this.fsQuad.render(t),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=ls.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[l]),t.clear(),this.fsQuad.render(t),a=this.renderTargetsVertical[l];this.fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this.fsQuad.render(t),this.fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,r&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(n),this.fsQuad.render(t)),t.setClearColor(this._oldClearColor,this.oldClearAlpha),t.autoClear=o}getSeperableBlurMaterial(t){const e=[];for(let n=0;n<t;n++)e.push(.39894*Math.exp(-.5*n*n/(t*t))/t);return new Le({defines:{KERNEL_RADIUS:t},uniforms:{colorTexture:{value:null},invSize:{value:new tt(.5,.5)},direction:{value:new tt(.5,.5)},gaussianCoefficients:{value:e}},vertexShader:`varying vec2 vUv;
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
				}`})}getCompositeMaterial(t){return new Le({defines:{NUM_MIPS:t},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
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
				}`})}}ls.BlurDirectionX=new tt(1,0);ls.BlurDirectionY=new tt(0,1);function b_(i,t,e){const n=new __(i);n.addPass(new M_(t,e));const s=new ls(new tt(window.innerWidth,window.innerHeight),.62,.85,.62);n.addPass(s);const r=new Gu({uniforms:{tDiffuse:{value:null},uContrast:{value:1.12},uSaturation:{value:1.18},uVignette:{value:.32},uWarmShadows:{value:new St(1712696)},uWarmHighlights:{value:new St(16771268)},uGrain:{value:.035}},vertexShader:`
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
    `});return n.addPass(r),n.addPass(new y_),n}function E_(){const i=new Xr(-12,12,8,-8,.1,200);return i.position.set(15,16,15),i.lookAt(0,.4,-.8),Vu(i,window.innerWidth,window.innerHeight),i}function Vu(i,t,e){const n=t/Math.max(1,e),s=t<760?23:t<1100?21:17.4,r=s*n;i.left=-r/2,i.right=r/2,i.top=s/2,i.bottom=-s/2,i.updateProjectionMatrix()}function T_(i){const t=new Sv({canvas:i,antialias:!0,powerPreference:"high-performance"});return t.setPixelRatio(Math.min(window.devicePixelRatio,1.5)),t.setSize(window.innerWidth,window.innerHeight,!1),t.outputColorSpace=tn,t.toneMapping=bo,t.toneMappingExposure=1.12,t.shadowMap.enabled=!0,t.shadowMap.type=eu,t}function w_(){const i=new bv;i.background=new St(528409),i.fog=new qr(662824,.025);const t=new Wv(12576511,2765600,1.25);i.add(t);const e=new Ga(16773320,3.7);e.position.set(-7,12,8),e.castShadow=!0,e.shadow.mapSize.set(2048,2048),e.shadow.camera.left=-18,e.shadow.camera.right=18,e.shadow.camera.top=18,e.shadow.camera.bottom=-18,e.shadow.bias=-15e-5,e.shadow.normalBias=.04,i.add(e);const n=new Ga(7060991,.9);n.position.set(9,5,-8),i.add(n);const s=new Ga(9437138,1.25);s.position.set(4,9,-12),i.add(s);const r=new zu(16767392,.6,26,2);return r.position.set(0,6,-1),i.add(r),i}function A_(i,t,e){const n=T_(i),s=w_(),r=E_(),o=b_(n,s,r),a=C_(r,i),l=new f_(s,t),c=new qv,u=new tt,h=new ku;let d=0,p=!1,g=document.hidden;const _=1e3/40;let m=0;const f=()=>R_(n,o,r);window.addEventListener("resize",f);const S=()=>{g=document.hidden};document.addEventListener("visibilitychange",S);const x=P=>{var L,B;const w=i.getBoundingClientRect();u.x=(P.clientX-w.left)/w.width*2-1,u.y=-((P.clientY-w.top)/w.height)*2+1,c.setFromCamera(u,r);const I=((L=c.intersectObjects(l.pickables,!0)[0])==null?void 0:L.object)??null,E=l.findCellTarget(I);if(E&&((B=e.onPickCell)!=null&&B.call(e,E.districtId,E.cellIndex)))return;const y=l.findDistrictId(I);y&&e.onSelectDistrict(y)};i.addEventListener("pointerdown",x);const T=(P=0)=>{if(p||(d=window.requestAnimationFrame(T),g)||P-m<_)return;m=P;const w=h.getElapsedTime();l.tick(w),a.update(),o.render()};return{update:P=>l.updateFromState(P),playYearTransition:P=>l.playYearTransition(P),setDataLayer:P=>l.setDataLayer(P),start:()=>{f(),T()},dispose:()=>{p=!0,window.cancelAnimationFrame(d),window.removeEventListener("resize",f),document.removeEventListener("visibilitychange",S),i.removeEventListener("pointerdown",x),a.dispose(),n.dispose()}}}function C_(i,t){const e=new jv(i,t);return e.enableDamping=!0,e.dampingFactor=.08,e.minZoom=.62,e.maxZoom=1.65,e.minPolarAngle=Math.PI*.22,e.maxPolarAngle=Math.PI*.38,e.enableRotate=!0,e.enablePan=!0,e.target.set(0,.4,-1),e}function R_(i,t,e){const n=window.innerWidth,s=window.innerHeight;i.setPixelRatio(Math.min(window.devicePixelRatio,1.5)),i.setSize(n,s,!1),t.setSize(n,s),Vu(e,n,s)}function Ye(i,t=1){return Number.isFinite(i)?i.toFixed(t):"資料缺漏"}function P_(i,t=1){return Number.isFinite(i)?`${i>0?"+":""}${i.toFixed(t)}`:"資料缺漏"}function Wu(i){return Number.isFinite(i)?`${Math.round(i*100)}%`:"資料缺漏"}function Xu(i){return Number.isFinite(i)?Math.round(i).toLocaleString("zh-TW"):"資料缺漏"}function As(i){return i.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function Oo(i){return`${Number.isInteger(i.current)?String(i.current):i.current.toFixed(1)}${i.unit??""}`}function zr(i){return`${Math.round(i)} 百萬`}function $u(i){const t={"SDG 3":"健康福祉","SDG 6":"潔淨水","SDG 7":"可負擔能源","SDG 9":"產業創新","SDG 10":"減少不平等","SDG 11":"永續城市","SDG 12":"責任消費","SDG 13":"氣候行動","SDG 15":"陸域生態"};return i.map(e=>`${e} ${t[e]??""}`.trim()).join(" / ")}function L_(i){return{emissions:"排放",heatRisk:"熱風險",floodRisk:"洪水風險",airQualityRisk:"空氣風險",publicHealth:"公共健康",equity:"公平性",publicTrust:"公共信任",biodiversity:"生物多樣性",energySecurity:"能源安全",educationScore:"教育分數"}[i]??i}function D_(i){return i==="emissions"||i==="heatRisk"||i==="floodRisk"||i==="airQualityRisk"}function Cs(i){return i>=72?"danger":i>=54?"warn":"good"}function Fo(i){return i>=68?"good":i>=50?"warn":"danger"}function I_(i){const t=i.mission,e=vh(i),n=xo(i),s=t.objectives.filter(r=>r.passed).length;return`
    <section class="mission-chip mission-panel-open">
      <div>
        <span>${t.chapter}</span>
        <strong>${t.title}</strong>
      </div>
      <div class="chip-stats">
        <b>${e}</b><small>回合</small>
        <b>${n}/${t.policyLimitPerTurn}</b><small>政策</small>
        <b>${s}/${t.objectives.length}</b><small>目標</small>
      </div>
      <div class="mission-objectives">
        ${t.objectives.map(z_).join("")}
      </div>
    </section>
  `}function U_(i){return`
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
  `}function N_(i,t){return`
    <section class="district-chip-panel">
      <span>目前街區</span>
      <strong>${t.name}</strong>
      <div class="mini-stat-row">
        ${ji("熱",t.heatExposure,!1)}
        ${ji("水",t.floodExposure,!1)}
        ${ji("空污",t.airPollution,!1)}
        ${ji("健康",t.healthIndex,!0)}
        ${ji("公平",t.equityIndex,!0)}
        ${ji("韌性",t.resilienceIndex,!0)}
      </div>
      <button class="text-link" type="button" data-open-guide="district">街區詳情</button>
    </section>
  `}function O_(i,t,e){const n=i.mission.status==="active"&&i.phase!=="complete"&&!e;return`
    <section class="command-bar" aria-label="主要行動">
      <div>
        <span>政策審議</span>
        <strong>本回合還可確認 ${Gr(i)} 項政策</strong>
      </div>
      <div class="dock-actions">
        <button class="ghost-btn sound-btn ${t?"enabled":""}" type="button" data-toggle-audio>
          ${t?"音效開":"啟動音效"}
        </button>
        <button class="ghost-btn" type="button" data-open-policy-board ${e?"disabled":""}>打開政策桌</button>
        <button class="primary-btn" type="button" data-advance ${n?"":"disabled"}>${e?"模擬中":"下一年"}</button>
      </div>
    </section>
  `}function qi(i,t,e,n){return`
    <div class="metric ${n}">
      <span>${i}</span>
      <strong>${Math.round(t)}${e}</strong>
    </div>
  `}function F_(i,t){const e=yo(t,i.id),n=!(e!=null&&e.affordable);return`
    <button class="policy-card ${i.category} ${n?"locked":""}" type="button" data-policy="${i.id}">
      <span class="policy-cost">${zr(i.cost)}</span>
      <strong>${i.name}</strong>
      <small>${$u(i.sdgs)}</small>
      <p>${i.summary}</p>
      <span class="inspect-label">查看政策</span>
      ${e?`<div class="preview-row">
              ${Ce("熱風險",e.deltas.heatRisk,!0)}
              ${Ce("健康",e.deltas.publicHealth,!1)}
              ${Ce("公平",e.deltas.equity,!1)}
              ${Ce("SDGs",e.deltas.sdgScore,!1)}
            </div>`:""}
    </button>
  `}function B_(i){return`
    <div class="objective ${i.passed?"passed":""}">
      <span>${i.passed?"達成":"追蹤"}</span>
      <strong>${i.label}</strong>
      <small>目前 ${Oo(i)}</small>
    </div>
  `}function z_(i){return`
    <div class="mission-objective ${i.passed?"passed":""}">
      <span>${i.passed?"達成":"追蹤"}</span>
      <strong>${i.label}</strong>
      <small>${Oo(i)}</small>
    </div>
  `}function Yi(i,t,e){return`
    <div class="district-stat ${e?Fo(t):Cs(t)}">
      <span>${i}</span>
      <strong>${Math.round(t)}</strong>
    </div>
  `}function ji(i,t,e){return`
    <span class="mini-stat ${e?Fo(t):Cs(t)}">
      ${i}<b>${Math.round(t)}</b>
    </span>
  `}function k_(i,t){return`
    <button
      type="button"
      class="district-chip ${i.id===t?"selected":""}"
      data-district="${i.id}"
    >
      ${i.name}
    </button>
  `}function Ce(i,t,e){const n=Math.round(t*10)/10,s=e?n<0:n>0,r=e?n>0:n<0,o=s?"good":r?"danger":"neutral",a=n>0?"+":"";return`
    <span class="delta-chip ${o}">
      ${i} ${a}${n}
    </span>
  `}function H_(i,t){const e=yo(i,t.id);if(i.mission.status==="briefing")return"請先開始任務，再確認政策投資。";if(i.phase==="complete")return"任務已結束，請使用重製任務重新開始。";if(!(e!=null&&e.canAffordBudget))return`預算不足：目前剩餘 ${zr(i.budget)}。`;if(((e==null?void 0:e.remainingActions)??0)<=0)return"本回合政策額度已用完，請進入下一年。"}const G_=[{name:"Open-Meteo",role:"Weather and climate stressors.",url:"https://open-meteo.com/en/docs",licenseOrAccess:"Free public API, no key for normal use.",productionUse:"Temperature, precipitation, wind, flood expansion, and classroom-friendly live data."},{name:"NASA POWER",role:"Solar radiation and climate-energy signals.",url:"https://power.larc.nasa.gov/docs/services/api/",licenseOrAccess:"Free public API.",productionUse:"Solar potential, precipitation, temperature, and renewable energy missions."},{name:"World Bank Indicators API",role:"Population and development indicators.",url:"https://datahelpdesk.worldbank.org/knowledgebase/articles/889392",licenseOrAccess:"Free public API, no key.",productionUse:"Population, urbanization, energy access, GDP, education, and health context."},{name:"UNSD SDG API",role:"Official SDG metadata.",url:"https://unstats.un.org/SDGAPI/swagger/",licenseOrAccess:"Free public API.",productionUse:"SDG indicator labels, official framing, and report outputs."},{name:"Open-Meteo Air Quality (CAMS)",role:"Air quality (PM2.5) without an API key.",url:"https://open-meteo.com/en/docs/air-quality-api",licenseOrAccess:"Free public API, no key. Data from Copernicus CAMS.",productionUse:"Default real-time PM2.5 source feeding the US EPA AQI and air-risk model."},{name:"OpenAQ (optional)",role:"Ground-station air quality observations.",url:"https://docs.openaq.org/about/about",licenseOrAccess:"Free account, API key required.",productionUse:"Optional: when a key is supplied, station PM2.5 overrides the CAMS reanalysis. Keep key out of client code for production."}];function V_(i,t,e,n){const s=J_(i),r=W_(i),o=q_(e);return`
    <section class="modal-scrim data-scrim">
      <article class="guide-card data-briefing-card">
        <button class="close-btn" type="button" aria-label="關閉資料教學" data-close-data-guide>x</button>
        <span>城市資料診斷課</span>
        <h1>今天的台北，哪裡最需要被保護？</h1>
        <p>
          你現在不是在看一份 API 清單，而是在替一座城市做上場前的健康檢查。等一下你會用有限預算做政策選擇，
          所以先要讀懂：現在最危險的是熱、雨、空氣，還是哪個街區特別脆弱。
        </p>
        ${t==="loading"?'<div class="data-loading-strip">公開資料載入中，請稍候...</div>':""}
        ${t==="error"?`<div class="data-status-error">資料載入失敗：${As(n??"未知錯誤")}</div>`:""}

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
            ${X_()}
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
            ${Q_(i)}
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
            ${$_()}
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
            ${Y_(e)}
          </div>
          <div class="data-source-table">
            <div class="data-source-head">
              <b>來源</b><b>提供的線索</b><b>判讀限制</b>
            </div>
            ${j_(e)}
          </div>
        </section>

        <div class="data-tutorial-actions">
          <button class="ghost-btn large" type="button" data-close-data-guide>回到任務簡介</button>
          <button class="primary-btn large" type="button" data-start-mission ${t==="ready"?"":"disabled"}>
            我已理解資料，開始任務
          </button>
        </div>
      </article>
    </section>
  `}function W_(i){const t=i.climateSignals;return[{kicker:"熱",title:"近年暑季是否已經有熱浪壓力？",value:`${Ye(t.heatwaveDaysPerSeason)} 熱浪日 / ${Ye(t.tropicalNightsPerSeason)} 熱夜`,question:"這裡看的是近 5 個完整暖季，不是今天。熱浪日越多，代表城市每年需要面對的高溫壓力越常出現。",whyItMatters:"熱夜會讓身體沒有恢復時間，會增加中暑、用電尖峰與戶外工作風險。",policyHint:"等一下優先檢查：樹冠降溫、降溫避難網、弱勢街區可近性。",tone:"heat"},{kicker:"雨",title:"雨季強降雨是否讓街區更容易積水？",value:`${Ye(t.heavyRainDaysPerSeason)} 強降雨日 / ${Ye(t.precipitationAnomalyRatio,2)} 倍`,question:"這裡看近 5 個完整暖季的強降雨日與雨量異常，不是某一天剛好下大雨。",whyItMatters:"同一場雨，低窪河岸和鋪面多的街區會比高地或濕地旁更容易積水。",policyHint:"等一下優先檢查：海綿街廓、濕地緩衝、防洪能力。",tone:"rain"},{kicker:"空氣",title:"空污會不會讓健康分數掉得更快？",value:`${Ye(t.pm25UgM3)} µg/m³ PM2.5`,question:"PM2.5 很小，可以進入呼吸系統；產業排放、交通與風速都會影響暴露。",whyItMatters:"老人、兒童、氣喘族群與戶外工作者，通常不是平均承受風險。",policyHint:"等一下優先檢查：產業空污治理、電動公車、空氣監測網。",tone:"air"},{kicker:"城市",title:"人口集中會不會放大政策後果？",value:`${Xu(t.population)} 人 / 都市人口 ${Wu(t.urbanPopulationRatio)}`,question:"人越集中，交通、排水、能源、綠地和避難設施就越需要精準配置。",whyItMatters:"公共健康與公平性不是抽象分數，而是關係到許多人的日常風險與服務可近性。",policyHint:"等一下優先檢查：公共健康、公平性、SDG 11 永續城市。",tone:"civic"}]}function X_(){return[{title:"暴露",body:"人、建築、道路或學校是否位在高溫、淹水、空污會影響的地方。",example:"例：河岸住宅區遇到豪雨，比高地更容易被水影響。"},{title:"脆弱度",body:"同樣遇到災害，哪些族群或街區比較缺少資源保護自己。",example:"例：老人、兒童、戶外工作者，面對熱浪時健康風險更高。"},{title:"調適",body:"用工程、自然系統與社會服務降低災害造成的傷害。",example:"例：樹蔭、避難點、海綿鋪面和濕地都屬於調適策略。"},{title:"取捨",body:"預算和政策數量有限，不能第一年把全部政策都買完。",example:"例：先救熱風險最高街區，可能暫時犧牲能源或產業治理速度。"}].map(t=>`
        <article class="concept-card">
          <h3>${t.title}</h3>
          <p>${t.body}</p>
          <small>${t.example}</small>
        </article>
      `).join("")}function $_(){return[{title:"先判斷主要威脅",prompt:"熱、雨、空氣三種壓力中，哪一種最可能讓本關失敗？你用哪個數值判斷？"},{title:"再判斷脆弱街區",prompt:"同樣的氣候壓力落到不同街區，哪裡會被放大？是低海拔、少樹蔭、交通弱，還是產業負荷高？"},{title:"最後選政策證據",prompt:"如果只能確認 2 項政策，你要先投資哪兩項？請說出它們分別對準哪個風險與任務目標。"}].map((t,e)=>`
        <article class="student-question-card">
          <span>${e+1}</span>
          <h3>${t.title}</h3>
          <p>${t.prompt}</p>
        </article>
      `).join("")}function q_(i){const t=i.filter(s=>s.status==="loaded").length,e=i.filter(s=>s.status==="failed"||s.status==="skipped").length,n=i.filter(s=>s.status==="fallback").length;return`本次整理到 ${t} 個即時來源，${e} 個來源受網路、API key 或缺測限制影響，${n} 個基準補值來源用來補足欄位。這不是要學生相信每個數字都完美，而是練習判斷資料品質。`}function Y_(i){const t=i.reduce((n,s)=>({...n,[s.status]:n[s.status]+1}),{loaded:0,failed:0,skipped:0,fallback:0});return[["loaded","即時載入"],["failed","連線失敗"],["skipped","缺 key 或缺測"],["fallback","基準補值"]].map(([n,s])=>`<span class="source-status-badge ${n}">${s} ${t[n]}</span>`).join("")}function j_(i){const t=new Map(i.map(n=>[n.name,n]));return[...G_.map(n=>{const s=Z_(n.name),r=t.get(n.name);return{name:n.name,url:n.url,status:r,pulledData:s.pulledData,studentNote:s.studentNote}}),{name:"台北本地基準補值",url:"/data/taipei-climate-baseline.json",status:t.get("台北本地基準補值"),pulledData:"作為教室離線或 API 缺項時的台北基準補值，避免單一資料源失效讓課程中斷。",studentNote:"不是玩家可切換的假資料；它用來補足缺漏欄位，讓同一套任務仍能討論資料不確定性。"}].map(n=>`
        <div class="data-source-row">
          <div>
            <a href="${n.url}" target="_blank" rel="noreferrer">${n.name}</a>
            ${n.status?K_(n.status):""}
          </div>
          <p>${n.pulledData}</p>
          <p>
            ${n.studentNote}
            ${n.status?`<small class="source-status-note">目前狀態：${As(n.status.note)}</small>`:""}
          </p>
        </div>
      `).join("")}function K_(i){const t={loaded:"已載入",failed:"失敗",skipped:"略過",fallback:"補值"};return`<span class="source-status-badge ${i.status}">${t[i.status]}</span>`}function Z_(i){return{"Open-Meteo":{pulledData:"近 5 個完整暖季的每日最高溫、最低溫、平均溫與日雨量，轉成熱浪日、熱夜、強降雨日與暖季月雨量。",studentNote:"用來回答「近年暑季與雨季風險是否常態化」，會直接推動熱風險與洪水風險分數。"},"NASA POWER":{pulledData:"同一段近 5 個完整暖季的每日太陽輻射，補強能源與太陽能潛力判讀。",studentNote:"用來討論為什麼屋頂太陽能、能源韌性與極端高溫會被放進同一個城市決策。"},"World Bank Indicators API":{pulledData:"國家尺度人口與都市人口比例，作為城市暴露人口與都市化背景。",studentNote:"不是街區人口普查，而是宏觀背景；學生要理解尺度不同時，資料解釋也會不同。"},"UNSD SDG API":{pulledData:"永續發展目標的官方指標語彙與分類，對應政策卡上的 SDG 學習框架。",studentNote:"它不直接改變熱風險或洪水風險，而是協助把政策效果連到 SDG 3、6、7、11、13 等目標。"},"Open-Meteo 空氣品質（CAMS）":{pulledData:"近 7 天的逐時 PM2.5（哥白尼大氣監測 CAMS 全球/歐洲再分析），平均後作為當前空污輸入。",studentNote:"免金鑰即可取得真實 PM2.5，會換算成 US EPA AQI 後推動空氣風險與公共健康分數。"},"OpenAQ（選用，需 API key）":{pulledData:"地面測站的 PM2.5 觀測；提供 API key 時，會以更在地的測站值覆蓋 CAMS 再分析值。",studentNote:"比較 CAMS 再分析與地面測站，可討論「模式 vs 實測」以及資料尺度與代表性的差異。"}}[i]??{pulledData:"公開資料源。",studentNote:"請在課堂上檢查資料來源、尺度、時間與可能限制。"}}function J_(i){const t=i.climateSignals;return[{key:"meanTemperatureC",label:"暖季平均氣溫",value:`${Ye(t.meanTemperatureC)} °C`,meaning:"近 5 個完整暖季的近地面平均溫度，用來描述城市暑季背景，而不是今天氣溫。",gameLink:"進入熱風險換算；與熱浪日、熱夜一起形成城市熱壓力。"},{key:"temperatureAnomalyC",label:"暖季溫度異常",value:`${P_(t.temperatureAnomalyC)} °C`,meaning:"代表暖季平均氣溫相對 27 °C 教學基準偏高或偏低多少。",gameLink:"正值越大，熱風險分數越高；樹冠與降溫避難設施會降低影響。"},{key:"heatwaveDaysPerSeason",label:"熱浪日",value:`${Ye(t.heatwaveDaysPerSeason)} 日/暖季`,meaning:"近 5 個完整暖季中，每年平均最高溫達熱浪門檻的天數。",gameLink:"直接轉入熱風險分數，讓關卡主題不受今天剛好熱不熱影響。"},{key:"tropicalNightsPerSeason",label:"熱夜",value:`${Ye(t.tropicalNightsPerSeason)} 日/暖季`,meaning:"近 5 個完整暖季中，每年平均夜間最低溫仍偏高的天數。",gameLink:"熱夜會加重健康壓力，特別影響老舊住宅與弱勢族群。"},{key:"monthlyPrecipitationMm",label:"暖季月雨量",value:`${Ye(t.monthlyPrecipitationMm,0)} mm`,meaning:"近 5 個完整暖季的平均每月雨量，協助學生感覺雨季累積壓力。",gameLink:"會推動洪水暴露；低海拔、河岸、海港與不透水鋪面多的街區更容易被放大。"},{key:"precipitationAnomalyRatio",label:"降雨異常倍率",value:`${Ye(t.precipitationAnomalyRatio,2)} 倍`,meaning:"把暖季月雨量與強降雨日合併成雨季壓力倍率。1 倍附近代表接近教學基準，高於 1 代表偏濕或強降雨偏多。",gameLink:"倍率越高，下一年遇到豪雨或排水不足事件時，洪水風險會更難壓低。"},{key:"heavyRainDaysPerSeason",label:"強降雨日",value:`${Ye(t.heavyRainDaysPerSeason)} 日/暖季`,meaning:"近 5 個完整暖季中，每年平均單日雨量達強降雨門檻的天數。",gameLink:"直接轉入洪水風險分數，尤其會放大河岸、海港與低窪街區風險。"},{key:"pm25UgM3",label:"PM2.5",value:`${Ye(t.pm25UgM3)} µg/m³`,meaning:"細懸浮微粒會進入呼吸系統，對老人、兒童、氣喘族群與戶外工作者影響較大。",gameLink:"進入空氣風險與公共健康計算；產業空污治理、電動公車與監測網會降低暴露。"},{key:"solarKwhM2Day",label:"太陽輻射",value:`${Ye(t.solarKwhM2Day,2)} kWh/m²/day`,meaning:"表示每天每平方公尺大約可接收多少太陽能，是估計屋頂太陽能潛力的線索。",gameLink:"支援屋頂太陽能與能源韌性政策；日照條件越好，低碳能源投資越容易被解釋。"},{key:"population",label:"人口背景",value:`${Xu(t.population)} 人`,meaning:"代表暴露人口的背景尺度。人口越集中，政策失誤或災害影響的人數可能越多。",gameLink:"用來提醒玩家：公共健康與公平性不是抽象分數，而是關係到很多人的日常風險。"},{key:"urbanPopulationRatio",label:"都市人口比",value:`${Wu(t.urbanPopulationRatio)}`,meaning:"表示人口集中在都市地區的比例。都市化越高，熱島、交通與排水壓力越需要治理。",gameLink:"連到 SDG 11 永續城市；政策要同時考慮基礎設施、交通、綠地與弱勢可近性。"}]}function Q_(i){return[{title:"熱風險",score:`目前 HUD：${Math.round(i.heatRisk)}`,formula:"暖季溫度異常 + 熱浪日 + 熱夜 + 不透水鋪面 - 樹冠覆蓋 - 降溫可近性",explanation:"遊戲會先把近 5 個暖季的熱浪資料換成熱壓力，再依街區柏油、樹蔭與避難點調整。",policies:"都市樹冠降溫、降溫避難網、公民科學監測網"},{title:"洪水風險",score:`目前 HUD：${Math.round(i.floodRisk)}`,formula:"暖季月雨量 + 強降雨日 + 降雨異常倍率 + 低海拔/河岸/海港 - 防洪能力",explanation:"遊戲會先把多年雨季強降雨換成水壓力，再依地形高度、排水、濕地與不透水面調整。",policies:"海綿街廓改造、濕地緩衝帶、河岸街區治理"},{title:"空氣風險",score:`目前 HUD：${Math.round(i.airQualityRisk)}`,formula:"PM2.5 + 產業負荷 - 大眾運輸可近性 - 樹冠覆蓋",explanation:"PM2.5 先換成空污壓力，再依產業區、交通可近性與樹冠覆蓋調整街區暴露。",policies:"產業空污治理、電動公車與低碳路網、公民科學監測網"},{title:"公共健康與公平性",score:`健康 ${Math.round(i.publicHealth)} / SDGs ${Math.round(i.sdgScore)}`,formula:"熱、洪水、空污風險 + 服務可近性 + 弱勢街區差異",explanation:"公共健康會由三種暴露分數扣分，再由降溫可近性與公平性補回；SDG 分數也會跟著變動。",policies:"降溫避難網、街區監測、公平導向的政策排序"}].map(e=>`
        <article class="data-bridge-card">
          <h3>${e.title}</h3>
          <em>${e.score}</em>
          <b>${e.formula}</b>
          <p>${e.explanation}</p>
          <small>政策連結：${e.policies}</small>
        </article>
      `).join("")}function tx(i){return`
    <section class="year-transition-panel" aria-live="polite">
      <span>年度模擬中</span>
      <strong>政策施工與意外事件正在城市中發生</strong>
      <div class="year-transition-track">
        <i></i>
      </div>
      <p>正在執行 ${xo(i)} 項政策，接著結算本年度意外事件。</p>
    </section>
  `}function ex(i){return`
    <section class="modal-scrim policy-board-scrim">
      <article class="policy-board-panel">
        <button class="close-btn" type="button" aria-label="關閉政策桌" data-close-policy-board>x</button>
        <span>政策審議桌</span>
        <h1>先閱讀，再確認投資</h1>
        <p>預算以百萬計算。每回合最多確認 ${i.mission.policyLimitPerTurn} 項政策，目前還可確認 ${Gr(i)} 項。</p>
        <div class="policy-row">
          ${vo.map(t=>F_(t,i)).join("")}
        </div>
      </article>
    </section>
  `}function nx(i,t,e){const n=i.mission,s=t==="loading",r=t==="ready",o=t==="error";return`
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
            ${mh.map(a=>`
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
            ${Za.map(a=>`
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
            ${r?"開始前請先閱讀資料來源、載入狀態、指標意義與模擬判讀方式，理解數據如何連到後面的政策任務。":o?`目前無法完成資料載入：${e??"未知錯誤"}。請確認網路後重試。`:"系統會呼叫 Open-Meteo、NASA POWER（搭配內政部人口統計與 OpenAQ 選用），整理成台北城市韌性任務的起始數據。"}
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
  `}function ix(i){const t=i.mission.status==="won",e=i.mission;return`
    <section class="modal-scrim">
      <div class="briefing-card ending ${t?"won":"lost"}">
        <span>${t?"任務成功":"任務失敗"}</span>
        <h1>${e.debriefTitle??e.title}</h1>
        <p>${e.debriefBody??""}</p>
        <div class="briefing-objectives">
          ${e.objectives.map(B_).join("")}
        </div>
        <div class="briefing-actions">
          <button class="primary-btn large" type="button" data-pick-mission>選擇其他副本</button>
          <button class="ghost-btn large" type="button" data-restart-game>重新開始整場遊戲</button>
        </div>
      </div>
    </section>
  `}function sx(i,t){const e=yo(i,t.id),n=H_(i,t),s=!n&&(e==null?void 0:e.affordable);return`
    <section class="modal-scrim policy-scrim">
      <article class="policy-detail-card ${t.category}">
        <button class="close-btn" type="button" aria-label="關閉政策詳情" data-close-policy>x</button>
        <span class="policy-kicker">${$u(t.sdgs)}</span>
        <h1>${t.name}</h1>
        <p class="policy-lead">${t.summary}</p>
        <div class="policy-detail-meta">
          <div><span>花費</span><strong>${zr(t.cost)}</strong></div>
          <div><span>投資範圍</span><strong>${(e==null?void 0:e.targetName)??"目前街區"}</strong></div>
          <div><span>學習焦點</span><strong>${t.learningFocus}</strong></div>
        </div>

        <div class="policy-detail-grid">
          <section>
            <h2>這項政策在科學上做了什麼？</h2>
            <p>${t.scienceNote}</p>
            <h2>為什麼會影響數值？</h2>
            <ul>
              ${t.effectExplanation.map(r=>`<li>${r}</li>`).join("")}
            </ul>
          </section>
          <section>
            <h2>投資後預估變化</h2>
            <div class="delta-board">
              ${e?Ce("預算",e.deltas.budget,!1):""}
              ${e?Ce("熱風險",e.deltas.heatRisk,!0):""}
              ${e?Ce("洪水風險",e.deltas.floodRisk,!0):""}
              ${e?Ce("空氣風險",e.deltas.airQualityRisk,!0):""}
              ${e?Ce("公共健康",e.deltas.publicHealth,!1):""}
              ${e?Ce("公平性",e.deltas.equity,!1):""}
              ${e?Ce("SDGs",e.deltas.sdgScore,!1):""}
            </div>
            <div class="classroom-prompt">
              <span>課堂討論</span>
              <p>${t.classroomPrompt}</p>
            </div>
          </section>
        </div>

        <div class="policy-confirm-row">
          <p>${n??`確認後會花費 ${zr(t.cost)}，本回合政策額度會減少 1。`}</p>
          <button class="primary-btn large" type="button" data-confirm-policy="${t.id}" ${s?"":"disabled"}>
            確認投資
          </button>
        </div>
      </article>
    </section>
  `}function rx(i){const t=i.evidenceLog,e={climate:"氣候訊號",district:"街區科學量",policy:"指標變化"};return`
    <section class="modal-scrim">
      <article class="guide-card evidence-card">
        <button class="close-btn" type="button" aria-label="關閉證據抽屜" data-close-evidence>x</button>
        <span>CER 證據抽屜</span>
        <h1>你的科學證據（${t.length} 筆）</h1>
        <p>每進入新的一年，系統會自動記錄關鍵科學量與資料來源。任務結束時，用這些證據完成你的主張（Claim）—證據（Evidence）—推理（Reasoning）論證。</p>
        ${t.length===0?'<p class="science-note">還沒有證據。啟動任務並推進年度後，證據會自動出現在這裡。</p>':`<div class="evidence-list">
                ${t.map(n=>`
                      <div class="evidence-entry ${n.kind}">
                        <small>${n.year} 年 · ${e[n.kind]}</small>
                        <strong>${As(n.label)}</strong>
                        <p>${As(n.value)}</p>
                        <em>來源：${As(n.source)}</em>
                      </div>
                    `).join("")}
              </div>`}
        <p class="science-note">
          提示：好的 Reasoning 會說明「為什麼這個證據支持你的主張」——例如用 UHI ΔT 的°C 變化解釋為何先在市中心種樹，而不是只說「數字變好了」。
        </p>
      </article>
    </section>
  `}function ax(i){const t=i.mission;return`
    <section class="modal-scrim">
      <article class="guide-card">
        <button class="close-btn" type="button" aria-label="關閉任務教材" data-close-guide>x</button>
        <span>任務教材</span>
        <h1>${t.title}</h1>
        <p>${t.stakes}</p>
        <div class="guide-grid">
          ${t.objectives.map(e=>`
                <div class="guide-tile ${e.passed?"passed":""}">
                  <strong>${e.label}</strong>
                  <p>${e.helper}</p>
                  <small>目前 ${Oo(e)}</small>
                </div>
              `).join("")}
        </div>
        <p class="science-note">
          遊戲重點：政策不是魔法按鈕。每個數值都來自暴露、脆弱度、可近性與基礎設施的關係。學生要練習先提出證據，再做取捨。
        </p>
      </article>
    </section>
  `}function ox(i){const t=i.currentChallenge;return`
    <section class="modal-scrim">
      <article class="guide-card">
        <button class="close-btn" type="button" aria-label="關閉事件解析" data-close-guide>x</button>
        <span>事件解析</span>
        <h1>${t.title}</h1>
        <p>${t.body}</p>
        <p class="science-note">${t.scienceNote}</p>
        <div class="delta-board">
          ${Object.entries(t.pressure).map(([e,n])=>Ce(L_(e),n,D_(e))).join("")}
        </div>
      </article>
    </section>
  `}function lx(i,t){return`
    <section class="modal-scrim">
      <article class="guide-card district-guide-card">
        <button class="close-btn" type="button" aria-label="關閉街區詳情" data-close-guide>x</button>
        <span>街區詳情</span>
        <h1>${t.name}</h1>
        <div class="district-grid expanded">
          ${Yi("熱暴露",t.heatExposure,!1)}
          ${Yi("淹水暴露",t.floodExposure,!1)}
          ${Yi("空污暴露",t.airPollution,!1)}
          ${Yi("健康",t.healthIndex,!0)}
          ${Yi("公平",t.equityIndex,!0)}
          ${Yi("韌性",t.resilienceIndex,!0)}
        </div>
        <div class="district-tabs expanded">
          ${i.districts.map(e=>k_(e,i.selectedDistrictId)).join("")}
        </div>
      </article>
    </section>
  `}function cx(i){return i?`
    <section class="modal-scrim">
      <article class="guide-card">
        <button class="close-btn" type="button" aria-label="關閉年度結算" data-close-guide>x</button>
        <span>年度結算</span>
        <h1>${i.year}: ${i.title}</h1>
        <p>${i.summary}</p>
        <p class="science-note">科學解析：${i.scienceNote}</p>
        <div class="delta-board">
          ${Ce("熱風險",i.deltas.heatRisk??0,!0)}
          ${Ce("公共健康",i.deltas.publicHealth??0,!1)}
          ${Ce("公平性",i.deltas.equity??0,!1)}
          ${Ce("SDGs",i.deltas.sdgScore??0,!1)}
          ${Ce("預算",i.deltas.budget??0,!1)}
        </div>
      </article>
    </section>
  `:""}const ux=[{id:"none",label:"一般"},{id:"heat",label:"熱暴露"},{id:"flood",label:"淹水"},{id:"air",label:"空污"},{id:"uhi",label:"UHI °C"},{id:"runoff",label:"逕流"}];function hx(i,t){i.className="hud-root";let e,n,s=!1,r=!1;i.addEventListener("click",a=>{const l=a.target,c=l.closest("[data-policy]"),u=l.closest("[data-district]"),h=l.closest("[data-open-guide]"),d=l.closest("[data-confirm-policy]");if(l.closest("[data-open-policy-board]")){s=!0,o();return}if(l.closest("[data-close-policy-board]")){s=!1,o();return}if(l.closest("[data-restart-game]")){t.onRestartGame();return}const p=l.closest("[data-mission]");if((p==null?void 0:p.dataset.mission)!==void 0){t.onSelectMission(Number(p.dataset.mission));return}if(l.closest("[data-pick-mission]")){t.onBackToMissionSelect();return}const g=l.closest("[data-layer]");if(g!=null&&g.dataset.layer){t.onSelectDataLayer(g.dataset.layer);return}const _=l.closest("[data-scenario]");if(_!=null&&_.dataset.scenario){t.onSelectScenario(_.dataset.scenario);return}if(l.closest("[data-open-evidence]")){r=!0,o();return}if(l.closest("[data-close-evidence]")){r=!1,o();return}if(l.closest("[data-close-policy]")){e=void 0,o();return}if(l.closest("[data-close-guide]")){n=void 0,o();return}if(l.closest("[data-open-data-guide]")){t.onOpenDataTutorial();return}if(l.closest("[data-close-data-guide]")){t.onCloseDataTutorial();return}if(l.closest("[data-reset-mission]")){e=void 0,n=void 0,s=!1,t.onResetMission();return}if(l.closest("[data-start-mission]")){t.onStartMission();return}if(d!=null&&d.dataset.confirmPolicy){e=void 0,t.onApplyPolicy(d.dataset.confirmPolicy);return}if(c!=null&&c.dataset.policy){e=c.dataset.policy,o();return}if(dx(h==null?void 0:h.dataset.openGuide)){n=h.dataset.openGuide,o();return}if(u!=null&&u.dataset.district){t.onSelectDistrict(u.dataset.district);return}if(l.closest("[data-advance]")){t.onAdvanceYear();return}if(l.closest("[data-toggle-audio]")){t.onToggleAudio();return}l.closest("[data-live-data]")&&t.onLoadLiveData()});const o=()=>{const a=t.getState(),l=a.districts.find(_=>_.id===a.selectedDistrictId)??a.districts[0],c=e?vo.find(_=>_.id===e):void 0,u=t.isYearProcessing(),h=t.getDataLoadStatus(),d=t.getDataLoadError(),p=t.getDataSourceStatuses(),g=t.isDataTutorialOpen();i.innerHTML=`
      <section class="top-hud" aria-label="城市狀態">
        <div class="brand-lockup">
          <span class="brand-mark"></span>
          <div>
            <strong>${a.cityName}</strong>
            <small>${a.year} 年 / ${a.mission.chapter} · 第 ${Math.min(a.turn,a.mission.turnLimit)} 回合${a.mission.turnLimit>100?"（無上限）":`，共 ${a.mission.turnLimit} 回合`}</small>
          </div>
        </div>
        <div class="metric-strip">
          ${qi("預算",a.budget,"百萬",a.budget<20?"danger":"good")}
          ${qi("SDGs",a.sdgScore,"",a.sdgScore>=70?"good":"warn")}
          ${qi("熱風險",a.heatRisk,"",Cs(a.heatRisk))}
          ${qi("洪水",a.floodRisk,"",Cs(a.floodRisk))}
          ${qi("空氣",a.airQualityRisk,"",Cs(a.airQualityRisk))}
          ${qi("健康",a.publicHealth,"",Fo(a.publicHealth))}
        </div>
      </section>

      <section class="layer-bar" aria-label="科學資料圖層">
        <span>圖層</span>
        ${ux.map(_=>`<button type="button" class="layer-btn ${t.getDataLayer()===_.id?"active":""}" data-layer="${_.id}">${_.label}</button>`).join("")}
        <button type="button" class="layer-btn evidence ${a.evidenceLog.length>0?"has-evidence":""}" data-open-evidence>
          證據抽屜（${a.evidenceLog.length}）
        </button>
        <button type="button" class="layer-btn restart" data-restart-game>重新開始</button>
      </section>

      ${I_(a)}
      ${U_(a)}
      ${N_(a,l)}
      ${O_(a,t.isAudioEnabled(),u)}
      ${u?tx(a):""}
      ${a.mission.status==="briefing"?nx(a,h,d):""}
      ${g?V_(a,h,p,d):""}
      ${a.mission.status==="won"||a.mission.status==="lost"?ix(a):""}
      ${s?ex(a):""}
      ${c?sx(a,c):""}
      ${n==="mission"?ax(a):""}
      ${n==="challenge"?ox(a):""}
      ${n==="district"?lx(a,l):""}
      ${n==="resolution"?cx(a.lastResolution):""}
      ${r?rx(a):""}
    `};return{render:o}}function dx(i){return i==="mission"||i==="challenge"||i==="district"||i==="resolution"}const fx={BASE_URL:"./",DEV:!1,MODE:"production",PROD:!0,SSR:!1},Bo="climate-resilience-lab/save/v1";function px(i){try{window.localStorage.setItem(Bo,JSON.stringify(i))}catch{}}function mx(){var i,t;try{const e=window.localStorage.getItem(Bo);if(!e)return;const n=JSON.parse(e);return typeof n.seed!="number"||!n.scenario||!Array.isArray(n.evidenceLog)||!n.mode||typeof n.missionIndex!="number"||!Array.isArray((t=(i=n.districts)==null?void 0:i[0])==null?void 0:t.cells)?void 0:n}catch{return}}function gx(){try{window.localStorage.removeItem(Bo)}catch{}}const qu=document.querySelector("#game-canvas"),Yu=document.querySelector("#hud-root");if(!qu||!Yu)throw new Error("Missing game canvas or HUD root.");const vx=mx();let ne=vx??vi(go()),Ae=!1,ja="none",Zi=!1,di="idle",kr,Wn=!1,Rs=[];const _x=5e3,ve=nh(),Ps=A_(qu,ne,{onSelectDistrict:i=>ju(i)}),fi=hx(Yu,{getState:()=>ne,onStartMission:()=>{if(di!=="ready"){Gc();return}Wn=!1;const i=ud(ne);yx(i.currentChallenge.soundCue),ve.startAmbience(i.currentChallenge.soundCue),ve.playEvent(i.currentChallenge.soundCue),en(i)},onApplyPolicy:i=>{if(Zi)return;const t=ne.appliedPolicies.length,e=hd(ne,i);Ae&&e.appliedPolicies.length>t?ve.playPolicy():Ae&&ve.playSelect(),en(e)},onAdvanceYear:()=>{if(Zi)return;const i=ne,t=dd(i);if(t===i||i.mission.status!=="active"){en(t);return}Zi=!0,Ps.playYearTransition(i),Mx(i),fi.render(),window.setTimeout(()=>{Zi=!1,Ae&&t.lastResolution&&ve.startAmbience(t.currentChallenge.soundCue),Ae&&i.mission.status!==t.mission.status&&(t.mission.status==="won"&&ve.playSuccess(),t.mission.status==="lost"&&ve.playFailure()),en(t)},_x)},onSelectDistrict:i=>ju(i),onResetMission:()=>Vc(),isAudioEnabled:()=>Ae,isYearProcessing:()=>Zi,onToggleAudio:()=>xx(),onLoadLiveData:()=>{Ae&&ve.playSelect(),Gc()},getDataLoadStatus:()=>di,getDataLoadError:()=>kr,getDataSourceStatuses:()=>Rs,isDataTutorialOpen:()=>Wn,onOpenDataTutorial:()=>{Wn=!0,fi.render()},onCloseDataTutorial:()=>{Wn=!1,fi.render()},getDataLayer:()=>ja,onSelectDataLayer:i=>{ja=i,Ae&&ve.playSelect(),Ps.setDataLayer(i),fi.render()},onSelectScenario:i=>{ne.mission.status==="briefing"&&(Ae&&ve.playSelect(),en({...ne,scenario:i}))},onRestartGame:()=>{window.confirm("確定要重新開始嗎？目前的城市進度與存檔將被清除。")&&(ja="none",Ps.setDataLayer("none"),Vc())},onSelectMission:i=>{ne.mission.status==="briefing"&&(Ae&&ve.playSelect(),en({...ne,missionIndex:i,mission:Wo(ne.seed,i)}))},onBackToMissionSelect:()=>{Ae&&ve.playSelect();const i=vi(go(void 0,{seed:ne.seed,scenario:ne.scenario}));en({...i,missionIndex:ne.missionIndex,mission:Wo(i.seed,ne.missionIndex)})}});fi.render();Ps.start();async function Gc(){if(di!=="loading"){di="loading",kr=void 0,Wn=!1,Rs=[],en({...ne,eventLog:["正在載入 Open-Meteo（含空氣品質）/ NASA POWER 公開資料與官方人口統計，並整理成任務起始數據。",...ne.eventLog].slice(0,10)});try{const i=await Wh(ne,{useNetwork:!0,openAqApiKey:Sx("VITE_OPENAQ_API_KEY")});Rs=i.sources,di="ready",Wn=!0,en({...fd(ne,i.signals),eventLog:["資料來源已整理，請先閱讀資料科普與來源狀態再開始任務。",...ne.eventLog].slice(0,10)})}catch(i){di="error",kr=String(i),Wn=!1,Rs=[],en({...ne,eventLog:[`公開資料載入失敗，請稍後重試。原因：${String(i)}`,...ne.eventLog].slice(0,10)})}}}function ju(i){var t;Ae&&ve.playSelect(),en({...ne,selectedDistrictId:i,eventLog:[`已選擇 ${((t=ne.districts.find(e=>e.id===i))==null?void 0:t.name)??i}。`,...ne.eventLog].slice(0,10)})}function Vc(){gx(),Zi=!1,di="idle",kr=void 0,Wn=!1,Rs=[];const i=vi(go());Ae&&(ve.startAmbience(i.currentChallenge.soundCue),ve.playEvent("civic")),en(i)}function xx(){Ae=!Ae,ve.setMuted(!Ae),Ae&&(ve.startAmbience(ne.currentChallenge.soundCue),ve.playEvent("civic")),fi.render()}function yx(i){Ae=!0,ve.setMuted(!1),ve.startAmbience(i)}function en(i){ne=i,px(ne),Ps.update(ne),fi.render()}function Mx(i){if(!Ae)return;const t=i.appliedPolicies.filter(n=>n.turn===i.turn).slice().reverse();t.forEach((n,s)=>{window.setTimeout(()=>ve.playPolicy(),260+s*720)});const e=Math.max(1200,680+t.length*720);window.setTimeout(()=>ve.playEvent(i.currentChallenge.soundCue),e)}function Sx(i){return fx[i]}

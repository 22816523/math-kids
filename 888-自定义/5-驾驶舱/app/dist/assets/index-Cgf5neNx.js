(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))n(a);new MutationObserver(a=>{for(const o of a)if(o.type==="childList")for(const r of o.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function s(a){const o={};return a.integrity&&(o.integrity=a.integrity),a.referrerPolicy&&(o.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?o.credentials="include":a.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(a){if(a.ep)return;a.ep=!0;const o=s(a);fetch(a.href,o)}})();const y="未归类",D=new Set(["app","src","dist","node_modules","sessions","archived_sessions","logs"]),K=[["收口","收口阶段"],["验收","验收阶段"],["开发","开发协同"],["联调","开发协同"],["评审","内部评审"],["方案","方案设计"],["需求","需求分析"]],U=[["先收口","先收口"],["先确认","先确认"],["边界","边界收口"],["风险","风险前置"],["评审","评审闭环"],["协同","协同推进"],["复盘","复盘沉淀"]],W=[["边界","边界未清"],["确认","确认待定"],["异常","异常策略"],["返工","返工风险"],["延期","进度风险"],["阻塞","依赖阻塞"]];function Y(e){return String(e??"").replace(/\//g,"\\")}function L(e){return Y(e).split(/[\\/]+/).map(t=>t.trim()).filter(Boolean)}function P(e){if(!e.length||e.includes(".codex"))return y;const t=e.findIndex(n=>n==="AI项目文档"||n==="AI项目");if(t>=0){const n=[];for(let a=t+1;a<e.length;a+=1){const o=e[a];if(D.has(o))break;if(n.length===0||n.length===1||/^\d+[-_]/.test(o))n.push(o);else break;if(n.length===2)break}if(n.length)return n.join("/")}const s=e.filter(n=>!D.has(n));return s.length>=2?s.slice(-2).join("/"):s[0]||y}function _(e="",t=""){const s=P(L(e));return s!==y?s:P(L(t))}function z(e){if(!e)return"";const t=new Date(e);return Number.isNaN(t.getTime())?"":t.toISOString().slice(0,10)}function b(e={}){const t=["timestamp","created_at","createdAt","updated_at","updatedAt","last_message_at","lastMessageAt","date","time"];for(const s of t){const n=z(e[s]);if(n)return n}return""}function f(e){if(e==null)return"";if(typeof e=="string")return e;if(typeof e=="number"||typeof e=="boolean")return String(e);if(Array.isArray(e))return e.map(f).filter(Boolean).join(`
`);if(typeof e=="object"){const s=["content","text","message","title","prompt","response","name","query","answer","result","output"].map(n=>f(e[n])).filter(Boolean);return s.length?s.join(`
`):Object.values(e).map(f).filter(Boolean).join(`
`)}return""}function G(e){for(const[t,s]of K)if(e.includes(t))return s;return"推进中"}function V(e){const t=[];for(const[s,n]of U)e.includes(s)&&!t.includes(n)&&t.push(n);return t.slice(0,5)}function Q(e){const t=[];for(const[s,n]of W)e.includes(s)&&!t.includes(n)&&t.push(n);return t.slice(0,3)}function j(e){return e.session_id||e.sessionId||e.conversation_id||e.conversationId||e.id||e.message_id||e.messageId||""}function T(e){return String(e.role||e.author_role||e.speaker||e.type||"").toLowerCase()}function $(e){const s=["content","text","message","title","prompt","response","result","output"].map(n=>f(e[n])).filter(Boolean).join(`
`);return s||f(e).trim()}function X(e){const t=String(e||"").split(/\r?\n/).map(n=>n.trim()).filter(Boolean),s=[];for(const n of t)try{s.push(JSON.parse(n))}catch{s.push({type:"text",content:n})}if(!s.length&&String(e||"").trim())try{const n=JSON.parse(e);return Array.isArray(n)?n:[n]}catch{return[{type:"text",content:e}]}return s}function Z(e,t){const s=e.find(n=>j(n));return s?j(s):t}function ee(e,t){var m;const s=[...e].sort((u,k)=>{const M=new Date(u.timestamp||u.created_at||u.createdAt||0).getTime(),H=new Date(k.timestamp||k.created_at||k.createdAt||0).getTime();return M-H}),n=s[0]||{},a=s.map($).filter(Boolean).join(`
`),o=_(n.cwd||n.path||t,n.project||t),r=b(n)||b(s.find(u=>b(u)))||"",l=n.title||n.summary||n.topic||n.name||((m=a.split(`
`).find(Boolean))==null?void 0:m.slice(0,24))||"未命名",d=n.session_id||n.sessionId||n.conversation_id||n.conversationId||t,p=s.filter(u=>T(u).includes("user")||$(u).includes("？")||$(u).includes("?")).length,v=s.filter(u=>T(u).includes("tool")||u.type==="tool"||u.tool||u.tool_name||u.toolName).length,g=Array.from(new Set([...V(a),o===y?"未归类":"项目"])).slice(0,5);return{sessionId:d,title:l,project:o,date:r,questionCount:p,toolCalls:v,messageCount:s.length,tags:g,stage:G(a),risks:Q(a),rawText:a,sourcePath:t,cwd:n.cwd||""}}function x(e=[]){const t=[],s=new Map;e.forEach(a=>{const o=a.path||a.webkitRelativePath||a.name||"",r=X(a.content||""),l=Z(r,o);r.forEach((d,p)=>{const v=j(d)||l,g=$(d),m={id:`${o}:${p}`,sessionId:v,role:T(d)||"text",type:d.type||d.event||"message",title:d.title||"",date:b(d),project:_(d.cwd||o,d.project||""),text:g,sourcePath:o,raw:d};t.push(m),s.has(v)||s.set(v,[]),s.get(v).push({...d,path:o})})});const n=Array.from(s.entries()).map(([a,o])=>{var r;return ee(o,((r=o[0])==null?void 0:r.path)||a)}).sort((a,o)=>{const r=new Date(a.date||0).getTime();return new Date(o.date||0).getTime()-r});return{records:t,sessions:n}}function te(e){return new Set(e.map(t=>t.date).filter(Boolean)).size}function se(e,t){var v,g;const s=t.length,n=t.reduce((m,u)=>m+u.toolCalls,0),a=t.reduce((m,u)=>m+u.questionCount,0),o=Array.from(new Set(t.flatMap(m=>m.risks))).slice(0,3),r=o[0]||"待确认",l=((v=t[0])==null?void 0:v.stage)||"推进中",d=((g=t[0])==null?void 0:g.date)||"",p=Array.from(new Set(t.flatMap(m=>m.tags).filter(Boolean).slice(0,6)));return{name:e,stage:l,progress:Math.min(96,32+s*7+n),sessionCount:s,toolCalls:n,questionCount:a,lastDate:d,keywords:p,issue:r,risks:o,work:t.slice(0,3).map(m=>m.title),value:s>1?"推进中枢":"单点收口",method:p.slice(0,2).join(" / ")||"边界收口"}}function ne(e){return e.map(t=>({id:t.sessionId,title:t.title,project:t.project,date:t.date,tags:t.tags,text:[t.title,t.rawText,t.project,t.tags.join(" ")].join(" "),rawText:t.rawText,stage:t.stage,risks:t.risks,toolCalls:t.toolCalls}))}function C({sessions:e=[],records:t=[]}={}){const s=new Map;e.forEach(l=>{const d=l.project||y;s.has(d)||s.set(d,[]),s.get(d).push(l)});const n=Array.from(s.entries()).map(([l,d])=>se(l,d.sort((p,v)=>new Date(v.date||0)-new Date(p.date||0)))).sort((l,d)=>d.sessionCount-l.sessionCount),a={sessionCount:e.length,recordCount:t.length,projectCount:n.length,toolCount:e.reduce((l,d)=>l+d.toolCalls,0),activeDays:te(e)},o=n[0]||{name:"未导入",stage:"待导入",progress:0,sessionCount:0,toolCalls:0,questionCount:0,lastDate:"",keywords:[],issue:"等待导入目录",work:[],value:"等待数据",method:"等待数据"},r=ne(e);return{summary:a,focusProject:o,projects:n,sessions:e,records:t,searchIndex:r}}function ae(e=[],t=""){const s=String(t||"").trim().toLowerCase();return s?e.filter(n=>[n.title,n.project,n.date,n.text,...n.tags||[]].filter(Boolean).join(" ").toLowerCase().includes(s)):e}const B=[{id:"home",label:"首页"},{id:"search",label:"对话检索"},{id:"projects",label:"项目详情"},{id:"reports",label:"月报生成"},{id:"settings",label:"设置"}],R=[{path:"sessions/2026/04/2026-04-30.jsonl",content:[JSON.stringify({session_id:"demo-001",role:"user",content:"纸张管理项目首页改成聚焦项目。",timestamp:"2026-04-30T09:00:00+08:00",cwd:"D:\\文档\\JTY\\AI项目文档\\888-自定义\\5-驾驶舱"}),JSON.stringify({role:"assistant",content:"已收紧首页层级，移除解释文案。",timestamp:"2026-04-30T09:01:00+08:00"}),JSON.stringify({type:"tool",name:"shell_command",content:"Get-ChildItem",timestamp:"2026-04-30T09:02:00+08:00"})].join(`
`)},{path:"sessions/2026/04/2026-04-29.jsonl",content:[JSON.stringify({session_id:"demo-002",title:"月报结构",role:"user",content:"按项目输出月报，保留原文，支持搜索。",timestamp:"2026-04-29T18:10:00+08:00",cwd:"D:\\文档\\JTY\\AI项目文档\\888-自定义\\5-驾驶舱"}),JSON.stringify({role:"assistant",content:"月报保留项目、数据、价值、方法。",timestamp:"2026-04-29T18:11:00+08:00"})].join(`
`)},{path:"session_index.jsonl",content:[JSON.stringify({session_id:"demo-idx",title:"驾驶舱原型",cwd:"D:\\文档\\JTY\\AI项目文档\\888-自定义\\5-驾驶舱",created_at:"2026-04-28T08:30:00+08:00",project:"888-自定义/5-驾驶舱"})].join(`
`)}],ie=[["主数据源","本机文件导入"],["项目目录","888-自定义/5-驾驶舱"],["自动刷新","17:00 / 23:00"],["原文","默认折叠"]],i={activeTab:"home",keyword:"",importedLabel:"默认示例",importedFiles:[],lastRefresh:new Date,refreshTimers:[],reportProject:"",dashboard:C(x(R))},oe=document.getElementById("app"),O="folderInput";function S(e){return String(e).padStart(2,"0")}function N(e){return`${S(e.getHours())}:${S(e.getMinutes())}:${S(e.getSeconds())}`}function c(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function re(e){return String(e).replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function w(e,t){const s=c(e),n=String(t||"").trim();if(!n)return s;const a=new RegExp(re(n),"ig");return s.replace(a,o=>`<mark>${o}</mark>`)}function F(e){return`<div class="progress"><span style="width:${Math.max(0,Math.min(100,e))}%"></span></div>`}function ce(e){const t=["需求","方案","评审","协同","收口"],s=t.findIndex(n=>String(e).includes(n));return t.map((n,a)=>({label:n,active:s>=0?a<=s:a===0}))}function de(){var t;const e=i.dashboard.projects.find(s=>s.name===i.reportProject);return(e==null?void 0:e.name)||((t=i.dashboard.projects[0])==null?void 0:t.name)||""}function I(e){return i.dashboard.sessions.filter(t=>t.project===e)}function le(e,t){var d;const s=t.map(p=>p.date).filter(Boolean),n=s.at(-1)||"—",a=s[0]||"—",o=e.work.length?e.work:["待补充"],r=e.method||"边界收口",l=(d=e.risks)!=null&&d.length?e.risks:["待确认"];return[`项目名称：${e.name}`,`统计周期：${n} - ${a}`,"","1. 项目概述",`- 阶段：${e.stage}`,`- 当前状态：${e.value}`,"","2. 本期工作",...o.map(p=>`- ${p}`),"","3. 数据支撑",`- 会话数：${e.sessionCount}`,`- 提问数：${e.questionCount}`,`- 工具调用数：${e.toolCalls}`,`- 原文条数：${t.length}`,"","4. 工作价值",`- 推进结果：${e.value}`,`- 关键判断：${e.issue}`,"","5. 方法论沉淀",`- 复用做法：${r}`,`- 风险识别：${l.join(" / ")}`,"","6. 遗留问题",`- 当前阻塞：${e.issue}`].join(`
`)}async function ue(e){const t=Array.from(e||[]).filter(n=>{const a=n.name.toLowerCase();return a.endsWith(".jsonl")||a.endsWith(".json")||a.endsWith(".txt")||a.endsWith(".md")}),s=[];for(const n of t)s.push({path:n.webkitRelativePath||n.name,content:await n.text()});return{files:t,entries:s}}function q(e,t){const s=x(e);i.dashboard=C(s),i.importedLabel=t,i.reportProject=i.dashboard.focusProject.name,i.lastRefresh=new Date,h(),E()}async function J(){if(i.importedFiles.length){const e=[];for(const t of i.importedFiles)e.push({path:t.webkitRelativePath||t.name,content:await t.text()});q(e,i.importedLabel);return}i.dashboard=C(x(R)),i.reportProject=i.dashboard.focusProject.name,i.lastRefresh=new Date,h(),E()}function E(){i.refreshTimers.forEach(t=>clearTimeout(t)),i.refreshTimers=[];const e=new Date;[17,23].forEach(t=>{const s=new Date(e);s.setHours(t,0,0,0),s<=e&&s.setDate(s.getDate()+1),i.refreshTimers.push(setTimeout(()=>{J()},s.getTime()-e.getTime()))})}function A(){var a,o;const e=i.dashboard.focusProject,t=ce(e.stage),s=(a=e.risks)!=null&&a.length?e.risks:[e.issue],n=I(e.name).slice(0,3);return`
    <section class="tab-panel home-shell">
      <div class="card section home-banner">
        <div class="decision-badges">
          <span class="tag hot">主项目 ${c(e.name)}</span>
          <span class="tag blue">阶段 ${c(e.stage)}</span>
          <span class="tag">刷新 ${N(i.lastRefresh)}</span>
        </div>
      </div>

      <div class="home-grid-top">
        <div class="card section home-main">
          <div class="section-head">
            <h3>主项目</h3>
            <span class="meta">${c(e.lastDate||"—")}</span>
          </div>
          <div class="project-name">${c(e.name)}</div>
          <div class="project-stage">${c(e.stage)}</div>
          <div class="project-flow">
            <div class="flow-step active"><strong>会话</strong><span>${e.sessionCount}</span></div>
            <div class="flow-step active"><strong>提问</strong><span>${e.questionCount}</span></div>
            <div class="flow-step active"><strong>工具</strong><span>${e.toolCalls}</span></div>
            <div class="flow-step active"><strong>进度</strong><span>${e.progress}%</span></div>
          </div>
          ${F(e.progress)}
          <div class="micro-kpis">
            <div class="micro-kpi"><div class="label">工作</div><div class="value">${e.work.length}</div></div>
            <div class="micro-kpi"><div class="label">方法</div><div class="value">${e.method?1:0}</div></div>
            <div class="micro-kpi"><div class="label">风险</div><div class="value">${((o=e.risks)==null?void 0:o.length)||0}</div></div>
            <div class="micro-kpi"><div class="label">记录</div><div class="value">${i.dashboard.summary.sessionCount}</div></div>
          </div>
        </div>

        <div class="home-side">
          <div class="card section">
            <div class="section-head"><h3>判断</h3></div>
            <div class="decision-track grid-2">
              <div class="decision-step active"><strong>状态</strong><span>${c(e.stage)}</span></div>
              <div class="decision-step"><strong>结果</strong><span>${c(e.value)}</span></div>
              <div class="decision-step"><strong>方法</strong><span>${c(e.method)}</span></div>
              <div class="decision-step"><strong>关键</strong><span>${c(e.issue)}</span></div>
            </div>
          </div>
          <div class="card section">
            <div class="section-head"><h3>阻塞</h3></div>
            <div class="risk-list">
              ${s.map((r,l)=>`
                    <div class="risk-item">
                      <span class="dot"></span>
                      <strong>${c(r)}</strong>
                      <span>${l+1}</span>
                    </div>
                  `).join("")}
            </div>
          </div>
        </div>
      </div>

      <div class="home-grid-bottom">
        <div class="card section">
          <div class="section-head"><h3>证据</h3></div>
          <div class="evidence-path">
            ${n.map(r=>`
                  <details class="evidence-node">
                    <summary>
                      <div class="badge">${c(r.date||"—")}</div>
                      <div><strong>${c(r.title)}</strong></div>
                    </summary>
                    <pre>${w(r.rawText,i.keyword)}</pre>
                  </details>
                `).join("")}
          </div>
        </div>
        <div class="card section">
          <div class="section-head"><h3>周期</h3></div>
          <div class="cycle-bar">
            ${t.map(r=>`
                  <div class="cycle ${r.active?"active":""}">
                    <strong>${r.label}</strong>
                    <span>${r.active?"进行中":"待命"}</span>
                  </div>
                `).join("")}
          </div>
        </div>
        <div class="card section">
          <div class="section-head"><h3>方法</h3></div>
          <div class="method-cloud">
            ${(e.tags||[]).map(r=>`<span class="pill">${c(r)}</span>`).join("")}
          </div>
        </div>
      </div>
    </section>
  `}function pe(){const e=ae(i.dashboard.searchIndex,i.keyword);return`
    <section class="tab-panel page-grid search-layout">
      <div class="card section filters">
        <div class="section-head"><h3>筛选</h3></div>
        <label>关键词<input id="searchInput" value="${c(i.keyword)}" placeholder="搜索项目 / 原文" /></label>
        <label>项目<select><option>全部</option><option>当前项目</option><option>最近项目</option></select></label>
        <button class="primary" id="searchBtn">搜索</button>
      </div>
      <div class="search-list">
        ${e.map(t=>`
              <details class="card section search-card">
                <summary>
                  <div class="item-head">
                    <strong>${w(t.title,i.keyword)}</strong>
                    <span class="tag blue">${c(t.project)}</span>
                  </div>
                  <div class="tags">
                    <span class="tag">${c(t.date||"—")}</span>
                    <span class="tag hot">工具 ${t.toolCalls||0}</span>
                    ${(t.tags||[]).map(s=>`<span class="tag">${c(s)}</span>`).join("")}
                  </div>
                </summary>
                <pre>${w(t.rawText,i.keyword)}</pre>
              </details>
            `).join("")}
      </div>
    </section>
  `}function ve(){return`
    <section class="tab-panel page-grid project-grid">
      ${i.dashboard.projects.map(e=>{const t=I(e.name);return`
            <div class="card section">
              <div class="project-head">
                <strong>${c(e.name)}</strong>
                <span class="tag ${e.stage.includes("评审")?"hot":"blue"}">${c(e.stage)}</span>
              </div>
              ${F(e.progress)}
              <div class="tags">
                <span class="tag hot">会话 ${e.sessionCount}</span>
                <span class="tag blue">提问 ${e.questionCount}</span>
                <span class="tag">工具 ${e.toolCalls}</span>
                <span class="tag">${c(e.lastDate||"—")}</span>
              </div>
              <div class="list">
                <div class="item"><strong>工作</strong><div class="muted">${c(e.work.join(" / ")||"—")}</div></div>
                <div class="item"><strong>价值</strong><div class="muted">${c(e.value)}</div></div>
                <div class="item"><strong>方法</strong><div class="muted">${c(e.method)}</div></div>
                <div class="item"><strong>阻塞</strong><div class="muted">${c(e.issue)}</div></div>
              </div>
              <details class="search-card">
                <summary>原文</summary>
                <div class="list">
                  ${t.slice(0,3).map(s=>`
                        <details class="mini-session">
                          <summary>
                            <span>${c(s.date||"—")}</span>
                            <strong>${c(s.title)}</strong>
                          </summary>
                          <pre>${w(s.rawText,i.keyword)}</pre>
                        </details>
                      `).join("")}
                </div>
              </details>
            </div>
          `}).join("")}
    </section>
  `}function me(){const e=de(),t=i.dashboard.projects.find(a=>a.name===e)||i.dashboard.projects[0],s=t?I(t.name):[],n=t?le(t,s):"暂无数据";return`
    <section class="tab-panel page-grid reports-layout">
      <div class="card section">
        <div class="section-head"><h3>项目</h3><span class="meta">按项目输出</span></div>
        <div class="list">
          ${i.dashboard.projects.map(a=>`
                <button class="project-select ${a.name===(t==null?void 0:t.name)?"active":""}" data-project="${c(a.name)}">
                  <strong>${c(a.name)}</strong>
                  <span>${c(a.stage)}</span>
                </button>
              `).join("")}
        </div>
      </div>
      <div class="card section report-area">
        <div class="section-head"><h3>月报</h3><span class="meta">${c((t==null?void 0:t.name)||"—")}</span></div>
        <pre class="report-editor">${c(n)}</pre>
      </div>
    </section>
  `}function ge(){return`
    <section class="tab-panel page-grid settings-layout">
      <div class="card section">
        <div class="section-head"><h3>数据源</h3><span class="meta">本机导入</span></div>
        <div class="list">
          ${ie.map(([e,t])=>`
                <div class="item">
                  <strong>${c(e)}</strong>
                  <div class="muted">${c(t)}</div>
                </div>
              `).join("")}
          <div class="item"><strong>导入</strong><div class="muted">${i.importedFiles.length} 文件</div></div>
          <div class="item"><strong>标签</strong><div class="muted">结果 / 影响 / 方法论标签</div></div>
        </div>
      </div>
      <div class="card section">
        <div class="section-head"><h3>统计</h3><span class="meta">当前状态</span></div>
        <div class="micro-kpis">
          <div class="micro-kpi"><div class="label">会话</div><div class="value">${i.dashboard.summary.sessionCount}</div></div>
          <div class="micro-kpi"><div class="label">原文</div><div class="value">${i.dashboard.summary.recordCount}</div></div>
          <div class="micro-kpi"><div class="label">项目</div><div class="value">${i.dashboard.summary.projectCount}</div></div>
          <div class="micro-kpi"><div class="label">活跃天</div><div class="value">${i.dashboard.summary.activeDays}</div></div>
        </div>
      </div>
    </section>
  `}function he(){switch(i.activeTab){case"home":return A();case"search":return pe();case"projects":return ve();case"reports":return me();case"settings":return ge();default:return A()}}function h(){var e;oe.innerHTML=`
    <div class="shell">
      <aside class="sidebar">
        <div class="brand">
          <h1>Codex 工作驾驶舱</h1>
        </div>
        <div class="nav">
          ${B.map(t=>`
                <button class="${t.id===i.activeTab?"active":""}" data-tab="${t.id}">
                  ${t.label}
                </button>
              `).join("")}
        </div>
        <div class="sidebar-card">
          <div class="row"><span><span class="status-dot"></span>自动刷新</span><strong>17:00 / 23:00</strong></div>
          <div class="row"><span>数据源</span><strong>${i.importedFiles.length||0} 份</strong></div>
          <div class="row"><span>刷新</span><strong>${N(i.lastRefresh)}</strong></div>
        </div>
        <div class="sidebar-card">
          <strong>${c(i.importedLabel)}</strong>
        </div>
      </aside>

      <main class="main">
        <div class="topbar">
          <div class="title">
            <h2>${((e=B.find(t=>t.id===i.activeTab))==null?void 0:e.label)||"首页"}</h2>
          </div>
          <div class="toolbar">
            <input id="globalSearch" type="text" value="${c(i.keyword)}" placeholder="搜索项目 / 原文 / 标签" />
            <button class="ghost" id="refreshBtn">刷新</button>
            <button class="primary" id="importBtn">导入目录</button>
            <input id="${O}" type="file" webkitdirectory multiple hidden />
          </div>
        </div>
        <div class="content">${he()}</div>
      </main>
    </div>
  `,fe()}function fe(){document.querySelectorAll(".nav button").forEach(r=>{r.addEventListener("click",()=>{i.activeTab=r.dataset.tab,h()})});const e=document.getElementById("globalSearch");e&&e.addEventListener("input",r=>{i.keyword=r.target.value.trim(),h()});const t=document.getElementById("searchInput");t&&t.addEventListener("input",r=>{i.keyword=r.target.value.trim(),h()}),document.querySelectorAll("[data-project]").forEach(r=>{r.addEventListener("click",()=>{i.reportProject=r.dataset.project,h()})});const s=document.getElementById("searchBtn");s&&s.addEventListener("click",()=>h());const n=document.getElementById("refreshBtn");n&&n.addEventListener("click",()=>{J()});const a=document.getElementById("importBtn"),o=document.getElementById(O);a&&o&&(a.addEventListener("click",()=>o.click()),o.addEventListener("change",async r=>{var p,v,g;const{files:l,entries:d}=await ue(r.target.files);i.importedFiles=l,i.importedLabel=((v=(p=l[0])==null?void 0:p.webkitRelativePath)==null?void 0:v.split(/[\\/]/)[0])||((g=l[0])==null?void 0:g.name)||"已导入",q(d,i.importedLabel)}))}h();E();

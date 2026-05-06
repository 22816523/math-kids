(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))t(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const d of o.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&t(d)}).observe(document,{childList:!0,subtree:!0});function a(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function t(i){if(i.ep)return;i.ep=!0;const o=a(i);fetch(i.href,o)}})();const y="未归类",P=new Set(["app","src","dist","node_modules","sessions","archived_sessions","logs"]),F=[["收口","收口阶段"],["验收","验收阶段"],["开发","开发协同"],["联调","开发协同"],["评审","内部评审"],["方案","方案设计"],["需求","需求分析"]],K=[["先收口","先收口"],["先确认","先确认"],["边界","边界收口"],["风险","风险前置"],["评审","评审闭环"],["协同","协同推进"],["复盘","复盘沉淀"]],z=[["边界","边界未清"],["确认","确认待定"],["异常","异常策略"],["返工","返工风险"],["延期","进度风险"],["阻塞","依赖阻塞"]];function Y(s){return String(s??"").replace(/\//g,"\\")}function D(s){return Y(s).split(/[\\/]+/).map(e=>e.trim()).filter(Boolean)}function A(s){if(!s.length||s.includes(".codex"))return y;const e=s.findIndex(t=>t==="AI项目文档"||t==="AI项目");if(e>=0){const t=s[e+1];if(t&&!P.has(t))return t}const a=s.filter(t=>!P.has(t));return a.length>=2?a[a.length-2]:a[0]||y}function L(s="",e=""){const a=A(D(s));return a!==y?a:A(D(e))}function G(s){if(!s)return"";const e=new Date(s);return Number.isNaN(e.getTime())?"":e.toISOString().slice(0,10)}function b(s={}){const e=["timestamp","created_at","createdAt","updated_at","updatedAt","last_message_at","lastMessageAt","date","time"];for(const a of e){const t=G(s[a]);if(t)return t}return""}function f(s){if(s==null)return"";if(typeof s=="string")return s;if(typeof s=="number"||typeof s=="boolean")return String(s);if(Array.isArray(s))return s.map(f).filter(Boolean).join(`
`);if(typeof s=="object"){const a=["content","text","message","title","prompt","response","name","query","answer","result","output"].map(t=>f(s[t])).filter(Boolean);return a.length?a.join(`
`):Object.values(s).map(f).filter(Boolean).join(`
`)}return""}function V(s){for(const[e,a]of F)if(s.includes(e))return a;return"推进中"}function Q(s){const e=[];for(const[a,t]of K)s.includes(a)&&!e.includes(t)&&e.push(t);return e.slice(0,5)}function W(s){const e=[];for(const[a,t]of z)s.includes(a)&&!e.includes(t)&&e.push(t);return e.slice(0,3)}function C(s){return s.session_id||s.sessionId||s.conversation_id||s.conversationId||s.id||s.message_id||s.messageId||""}function x(s){return String(s.role||s.author_role||s.speaker||s.type||"").toLowerCase()}function w(s){const a=["content","text","message","title","prompt","response","result","output"].map(t=>f(s[t])).filter(Boolean).join(`
`);return a||f(s).trim()}function X(s){const e=String(s||"").split(/\r?\n/).map(t=>t.trim()).filter(Boolean),a=[];for(const t of e)try{a.push(JSON.parse(t))}catch{a.push({type:"text",content:t})}if(!a.length&&String(s||"").trim())try{const t=JSON.parse(s);return Array.isArray(t)?t:[t]}catch{return[{type:"text",content:s}]}return a}function Z(s,e){const a=s.find(t=>C(t));return a?C(a):e}function ss(s,e){var p;const a=[...s].sort((l,k)=>{const H=new Date(l.timestamp||l.created_at||l.createdAt||0).getTime(),U=new Date(k.timestamp||k.created_at||k.createdAt||0).getTime();return H-U}),t=a[0]||{},i=a.map(w).filter(Boolean).join(`
`),o=L(t.cwd||t.path||e,t.project||e),d=b(t)||b(a.find(l=>b(l)))||"",u=t.title||t.summary||t.topic||t.name||((p=i.split(`
`).find(Boolean))==null?void 0:p.slice(0,24))||"未命名",c=t.session_id||t.sessionId||t.conversation_id||t.conversationId||e,g=a.filter(l=>x(l).includes("user")||w(l).includes("？")||w(l).includes("?")).length,v=a.filter(l=>x(l).includes("tool")||l.type==="tool"||l.tool||l.tool_name||l.toolName).length,m=Array.from(new Set([...Q(i),o===y?"未归类":"项目"])).slice(0,5);return{sessionId:c,title:u,project:o,date:d,questionCount:g,toolCalls:v,messageCount:a.length,tags:m,stage:V(i),risks:W(i),rawText:i,sourcePath:e,cwd:t.cwd||""}}function O(s=[]){const e=[],a=new Map;s.forEach(i=>{const o=i.path||i.webkitRelativePath||i.name||"",d=X(i.content||""),u=Z(d,o);d.forEach((c,g)=>{const v=C(c)||u,m=w(c),p={id:`${o}:${g}`,sessionId:v,role:x(c)||"text",type:c.type||c.event||"message",title:c.title||"",date:b(c),project:L(c.cwd||o,c.project||""),text:m,sourcePath:o,raw:c};e.push(p),a.has(v)||a.set(v,[]),a.get(v).push({...c,path:o})})});const t=Array.from(a.entries()).map(([i,o])=>{var d;return ss(o,((d=o[0])==null?void 0:d.path)||i)}).sort((i,o)=>{const d=new Date(i.date||0).getTime();return new Date(o.date||0).getTime()-d});return{records:e,sessions:t}}function es(s){return new Set(s.map(e=>e.date).filter(Boolean)).size}function ts(s,e){var v,m;const a=e.length,t=e.reduce((p,l)=>p+l.toolCalls,0),i=e.reduce((p,l)=>p+l.questionCount,0),o=Array.from(new Set(e.flatMap(p=>p.risks))).slice(0,3),d=o[0]||"待确认",u=((v=e[0])==null?void 0:v.stage)||"推进中",c=((m=e[0])==null?void 0:m.date)||"",g=Array.from(new Set(e.flatMap(p=>p.tags).filter(Boolean).slice(0,6)));return{name:s,stage:u,progress:Math.min(96,32+a*7+t),sessionCount:a,toolCalls:t,questionCount:i,lastDate:c,keywords:g,issue:d,risks:o,work:e.slice(0,3).map(p=>p.title),value:a>1?"推进中枢":"单点收口",method:g.slice(0,2).join(" / ")||"边界收口"}}function as(s){return s.map(e=>({id:e.sessionId,title:e.title,project:e.project,date:e.date,tags:e.tags,text:[e.title,e.rawText,e.project,e.tags.join(" ")].join(" "),rawText:e.rawText,stage:e.stage,risks:e.risks,toolCalls:e.toolCalls}))}function q({sessions:s=[],records:e=[]}={}){const a=new Map;s.forEach(u=>{const c=u.project||y;a.has(c)||a.set(c,[]),a.get(c).push(u)});const t=Array.from(a.entries()).map(([u,c])=>ts(u,c.sort((g,v)=>new Date(v.date||0)-new Date(g.date||0)))).sort((u,c)=>c.sessionCount-u.sessionCount),i={sessionCount:s.length,recordCount:e.length,projectCount:t.length,toolCount:s.reduce((u,c)=>u+c.toolCalls,0),activeDays:es(s)},o=t[0]||{name:"未导入",stage:"待导入",progress:0,sessionCount:0,toolCalls:0,questionCount:0,lastDate:"",keywords:[],issue:"等待导入目录",work:[],value:"等待数据",method:"等待数据"},d=as(s);return{summary:i,focusProject:o,projects:t,sessions:s,records:e,searchIndex:d}}const _=[{id:"home",label:"首页"},{id:"search",label:"对话检索"},{id:"projects",label:"项目详情"},{id:"reports",label:"月报生成"},{id:"settings",label:"设置"}],N=[{path:"sessions/2026/04/2026-04-30.jsonl",content:[JSON.stringify({session_id:"demo-001",role:"user",content:"纸张管理项目首页改成聚焦项目。",timestamp:"2026-04-30T09:00:00+08:00",cwd:"D:\\文档\\JTY\\AI项目文档\\888-自定义\\5-驾驶舱"}),JSON.stringify({role:"assistant",content:"已收紧首页层级，移除解释文案。",timestamp:"2026-04-30T09:01:00+08:00"}),JSON.stringify({type:"tool",name:"shell_command",content:"Get-ChildItem",timestamp:"2026-04-30T09:02:00+08:00"})].join(`
`)},{path:"sessions/2026/04/2026-04-29.jsonl",content:[JSON.stringify({session_id:"demo-002",title:"月报结构",role:"user",content:"按项目输出月报，保留原文，支持搜索。",timestamp:"2026-04-29T18:10:00+08:00",cwd:"D:\\文档\\JTY\\AI项目文档\\888-自定义\\5-驾驶舱"}),JSON.stringify({role:"assistant",content:"月报保留项目、数据、价值、方法。",timestamp:"2026-04-29T18:11:00+08:00"})].join(`
`)},{path:"session_index.jsonl",content:[JSON.stringify({session_id:"demo-idx",title:"驾驶舱原型",cwd:"D:\\文档\\JTY\\AI项目文档\\888-自定义\\5-驾驶舱",created_at:"2026-04-28T08:30:00+08:00",project:"888-自定义/5-驾驶舱"})].join(`
`)}],ns=[["主数据源","本机文件导入"],["项目目录","888-自定义"],["自动刷新","17:00 / 23:00"],["原文","默认折叠"]],n={activeTab:"home",keyword:"",dashboard:q(O(N)),sourceRoot:"C:\\Users\\zbb09\\.codex",status:"本机自动识别",lastRefresh:new Date,reportProject:"",loading:!1,searchResults:[]},j=new Map;let S=null;const is=document.getElementById("app");function T(s){return String(s).padStart(2,"0")}function M(s){return`${T(s.getHours())}:${T(s.getMinutes())}:${T(s.getSeconds())}`}function r(s){return String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function os(s){return String(s).replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function $(s,e){const a=r(s),t=String(e||"").trim();return t?a.replace(new RegExp(os(t),"ig"),i=>`<mark>${i}</mark>`):a}function J(s){return`<div class="progress"><span style="width:${Math.max(0,Math.min(100,s))}%"></span></div>`}function E(s){return n.dashboard.sessions.filter(e=>e.project===s)}function rs(){return n.dashboard.projects.find(s=>s.name===n.reportProject)||n.dashboard.projects[0]||null}async function R(){try{const s=await fetch("/api/dashboard",{cache:"no-store"});if(!s.ok)throw new Error(`HTTP ${s.status}`);const e=await s.json();n.dashboard=e.dashboard,n.sourceRoot=e.sourceRoot,n.status=e.status,n.lastRefresh=new Date(e.lastRefresh),!n.reportProject&&n.dashboard.projects[0]&&(n.reportProject=n.dashboard.projects[0].name),n.keyword?await I(n.keyword):n.searchResults=n.dashboard.sessions||[]}catch{n.status="后端未启动，当前显示示例数据",n.dashboard=q(O(N)),n.lastRefresh=new Date,!n.reportProject&&n.dashboard.projects[0]&&(n.reportProject=n.dashboard.projects[0].name),n.searchResults=n.dashboard.sessions||[]}h()}async function cs(){n.loading=!0,h();try{await fetch("/api/refresh",{method:"POST"}),await R()}finally{n.loading=!1}}async function I(s=""){const e=String(s||"").trim();try{const a=await fetch(`/api/search?q=${encodeURIComponent(e)}`,{cache:"no-store"});if(!a.ok)throw new Error(`HTTP ${a.status}`);const t=await a.json();n.searchResults=t.results||[]}catch{n.searchResults=[]}h()}async function ds(s){if(j.has(s))return j.get(s);const e=await fetch(`/api/session?id=${encodeURIComponent(s)}`,{cache:"no-store"});if(!e.ok)return null;const t=(await e.json()).session;return t!=null&&t.rawText&&j.set(s,t),t}function ls(s){const e=["需求","方案","评审","协同","收口"],a=e.findIndex(t=>String(s).includes(t));return e.map((t,i)=>({label:t,active:a>=0?i<=a:i===0}))}function B(){var t,i;const s=n.dashboard.focusProject,e=E(s.name).slice(0,3),a=ls(s.stage);return`
    <section class="tab-panel home-shell">
      <div class="card section home-banner">
        <div class="decision-badges">
          <span class="tag hot">主项目 ${r(s.name)}</span>
          <span class="tag blue">阶段 ${r(s.stage)}</span>
          <span class="tag">自动刷新 ${M(n.lastRefresh)}</span>
        </div>
      </div>

      <div class="home-grid-top">
        <div class="card section home-main">
          <div class="section-head">
            <h3>主项目</h3>
            <span class="meta">${r(s.lastDate||"—")}</span>
          </div>
          <div class="project-name">${r(s.name)}</div>
          <div class="project-stage">${r(s.stage)}</div>
          <div class="project-flow">
            <div class="flow-step active"><strong>会话</strong><span>${s.sessionCount}</span></div>
            <div class="flow-step active"><strong>提问</strong><span>${s.questionCount}</span></div>
            <div class="flow-step active"><strong>工具</strong><span>${s.toolCalls}</span></div>
            <div class="flow-step active"><strong>进度</strong><span>${s.progress}%</span></div>
          </div>
          ${J(s.progress)}
          <div class="micro-kpis">
            <div class="micro-kpi"><div class="label">工作</div><div class="value">${s.work.length}</div></div>
            <div class="micro-kpi"><div class="label">方法</div><div class="value">${s.method?1:0}</div></div>
            <div class="micro-kpi"><div class="label">风险</div><div class="value">${((t=s.risks)==null?void 0:t.length)||0}</div></div>
            <div class="micro-kpi"><div class="label">会话</div><div class="value">${n.dashboard.summary.sessionCount}</div></div>
          </div>
        </div>

        <div class="home-side">
          <div class="card section">
            <div class="section-head"><h3>判断</h3></div>
            <div class="decision-track grid-2">
              <div class="decision-step active"><strong>状态</strong><span>${r(s.stage)}</span></div>
              <div class="decision-step"><strong>结果</strong><span>${r(s.value)}</span></div>
              <div class="decision-step"><strong>方法</strong><span>${r(s.method)}</span></div>
              <div class="decision-step"><strong>关键</strong><span>${r(s.issue)}</span></div>
            </div>
          </div>
          <div class="card section">
            <div class="section-head"><h3>阻塞</h3></div>
            <div class="risk-list">
              ${((i=s.risks)!=null&&i.length?s.risks:[s.issue]).map((o,d)=>`
                <div class="risk-item">
                  <span class="dot"></span>
                  <strong>${r(o)}</strong>
                  <span>${d+1}</span>
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
            ${e.map(o=>`
              <details class="evidence-node" data-session-id="${r(o.sessionId)}">
                <summary>
                  <div class="badge">${r(o.date||"—")}</div>
                  <div><strong>${r(o.title)}</strong></div>
                </summary>
                <pre class="session-preview">${$(o.preview||"",n.keyword)}</pre>
              </details>
            `).join("")}
          </div>
        </div>
        <div class="card section">
          <div class="section-head"><h3>周期</h3></div>
          <div class="cycle-bar">
            ${a.map(o=>`
              <div class="cycle ${o.active?"active":""}">
                <strong>${o.label}</strong>
                <span>${o.active?"进行中":"待命"}</span>
              </div>
            `).join("")}
          </div>
        </div>
        <div class="card section">
          <div class="section-head"><h3>方法</h3></div>
          <div class="method-cloud">
            ${(s.tags||[]).map(o=>`<span class="pill">${r(o)}</span>`).join("")}
          </div>
        </div>
      </div>
    </section>
  `}function us(){const s=n.searchResults;return`
    <section class="tab-panel page-grid search-layout">
      <div class="card section filters">
        <div class="section-head"><h3>筛选</h3></div>
        <label>关键词<input id="searchInput" value="${r(n.keyword)}" placeholder="搜索项目 / 原文" /></label>
        <button class="primary" id="searchBtn">搜索</button>
      </div>
      <div class="search-list">
        ${s.map(e=>`
          <details class="card section search-card" data-session-id="${r(e.sessionId)}">
            <summary>
              <div class="item-head">
                <strong>${$(e.title,n.keyword)}</strong>
                <span class="tag blue">${r(e.project)}</span>
              </div>
              <div class="tags">
                <span class="tag">${r(e.date||"—")}</span>
                <span class="tag hot">工具 ${e.toolCalls||0}</span>
                ${(e.tags||[]).map(a=>`<span class="tag">${r(a)}</span>`).join("")}
              </div>
            </summary>
            <pre class="session-preview">${$(e.preview||"",n.keyword)}</pre>
          </details>
        `).join("")}
      </div>
    </section>
  `}function ps(){return`
    <section class="tab-panel page-grid project-grid">
      ${n.dashboard.projects.map(s=>{var a;const e=E(s.name);return`
          <div class="card section">
            <div class="project-head">
              <strong>${r(s.name)}</strong>
              <span class="tag ${s.stage.includes("评审")?"hot":"blue"}">${r(s.stage)}</span>
            </div>
            ${J(s.progress)}
            <div class="tags">
              <span class="tag hot">会话 ${s.sessionCount}</span>
              <span class="tag blue">提问 ${s.questionCount}</span>
              <span class="tag">工具 ${s.toolCalls}</span>
              <span class="tag">${r(s.lastDate||"—")}</span>
            </div>
            <div class="list">
              <div class="item"><strong>工作</strong><div class="muted">${r(s.work.join(" / ")||"—")}</div></div>
              <div class="item"><strong>价值</strong><div class="muted">${r(s.value)}</div></div>
              <div class="item"><strong>方法</strong><div class="muted">${r(s.method)}</div></div>
              <div class="item"><strong>阻塞</strong><div class="muted">${r(s.issue)}</div></div>
            </div>
            <details class="search-card" data-session-id="${r(((a=e[0])==null?void 0:a.sessionId)||s.name)}">
              <summary>原文</summary>
              <div class="list">
                ${e.slice(0,3).map(t=>`
                  <details class="mini-session" data-session-id="${r(t.sessionId)}">
                    <summary>
                      <span>${r(t.date||"—")}</span>
                      <strong>${r(t.title)}</strong>
                    </summary>
                    <pre class="session-preview">${$(t.preview||"",n.keyword)}</pre>
                  </details>
                `).join("")}
              </div>
            </details>
          </div>
        `}).join("")}
    </section>
  `}function vs(){var t,i;const s=rs(),e=s?E(s.name):[],a=s?[`项目名称：${s.name}`,`统计周期：${((t=e.at(-1))==null?void 0:t.date)||"—"} - ${((i=e[0])==null?void 0:i.date)||"—"}`,"","1. 项目概述",`- 阶段：${s.stage}`,`- 当前状态：${s.value}`,"","2. 本期工作",...s.work.length?s.work:["- 待补充"],"","3. 数据支撑",`- 会话数：${s.sessionCount}`,`- 提问数：${s.questionCount}`,`- 工具调用数：${s.toolCalls}`,`- 原文条数：${e.length}`,"","4. 工作价值",`- 推进结果：${s.value}`,`- 关键判断：${s.issue}`,"","5. 方法论沉淀",`- 复用做法：${s.method}`,`- 风险识别：${(s.risks||["待确认"]).join(" / ")}`,"","6. 遗留问题",`- 当前阻塞：${s.issue}`].join(`
`):"暂无数据";return`
    <section class="tab-panel page-grid reports-layout">
      <div class="card section">
        <div class="section-head"><h3>项目</h3><span class="meta">按项目输出</span></div>
        <div class="list">
          ${n.dashboard.projects.map(o=>`
            <button class="project-select ${o.name===(s==null?void 0:s.name)?"active":""}" data-project="${r(o.name)}">
              <strong>${r(o.name)}</strong>
              <span>${r(o.stage)}</span>
            </button>
          `).join("")}
        </div>
      </div>
      <div class="card section report-area">
        <div class="section-head"><h3>月报</h3><span class="meta">${r((s==null?void 0:s.name)||"—")}</span></div>
        <pre class="report-editor">${r(a)}</pre>
      </div>
    </section>
  `}function gs(){return`
    <section class="tab-panel page-grid settings-layout">
      <div class="card section">
        <div class="section-head"><h3>数据源</h3><span class="meta">本机自动识别</span></div>
        <div class="list">
          ${ns.map(([s,e])=>`
            <div class="item">
              <strong>${r(s)}</strong>
              <div class="muted">${r(e)}</div>
            </div>
          `).join("")}
          <div class="item"><strong>根目录</strong><div class="muted">${r(n.sourceRoot)}</div></div>
          <div class="item"><strong>状态</strong><div class="muted">${r(n.status)}</div></div>
        </div>
      </div>
      <div class="card section">
        <div class="section-head"><h3>统计</h3><span class="meta">当前状态</span></div>
        <div class="micro-kpis">
          <div class="micro-kpi"><div class="label">会话</div><div class="value">${n.dashboard.summary.sessionCount}</div></div>
          <div class="micro-kpi"><div class="label">原文</div><div class="value">${n.dashboard.summary.recordCount}</div></div>
          <div class="micro-kpi"><div class="label">项目</div><div class="value">${n.dashboard.summary.projectCount}</div></div>
          <div class="micro-kpi"><div class="label">活跃天</div><div class="value">${n.dashboard.summary.activeDays}</div></div>
        </div>
      </div>
    </section>
  `}function hs(){switch(n.activeTab){case"home":return B();case"search":return us();case"projects":return ps();case"reports":return vs();case"settings":return gs();default:return B()}}function h(){var s;is.innerHTML=`
    <div class="shell">
      <aside class="sidebar">
        <div class="brand">
          <h1>Codex 工作驾驶舱</h1>
        </div>
        <div class="nav">
          ${_.map(e=>`
            <button class="${e.id===n.activeTab?"active":""}" data-tab="${e.id}">
              ${e.label}
            </button>
          `).join("")}
        </div>
        <div class="sidebar-card">
          <div class="row"><span><span class="status-dot"></span>自动刷新</span><strong>17:00 / 23:00</strong></div>
          <div class="row"><span>数据源</span><strong>本机自动</strong></div>
          <div class="row"><span>刷新</span><strong>${M(n.lastRefresh)}</strong></div>
        </div>
        <div class="sidebar-card">
          <strong>${r(n.status)}</strong>
        </div>
      </aside>

      <main class="main">
        <div class="topbar">
          <div class="title">
            <h2>${((s=_.find(e=>e.id===n.activeTab))==null?void 0:s.label)||"首页"}</h2>
          </div>
          <div class="toolbar">
            <input id="globalSearch" type="text" value="${r(n.keyword)}" placeholder="搜索项目 / 原文 / 标签" />
            <button class="ghost" id="refreshBtn">${n.loading?"刷新中":"刷新"}</button>
          </div>
        </div>
        <div class="content">${hs()}</div>
      </main>
    </div>
  `,ms()}function ms(){document.querySelectorAll(".nav button").forEach(i=>{i.addEventListener("click",()=>{n.activeTab=i.dataset.tab,h()})});const s=document.getElementById("globalSearch");s&&s.addEventListener("input",i=>{n.keyword=i.target.value.trim(),h()}),document.querySelectorAll("[data-project]").forEach(i=>{i.addEventListener("click",()=>{n.reportProject=i.dataset.project,h()})});const e=document.getElementById("searchInput");e&&e.addEventListener("input",i=>{n.keyword=i.target.value.trim(),S&&clearTimeout(S),S=setTimeout(()=>{I(n.keyword)},180),h()});const a=document.getElementById("searchBtn");a&&a.addEventListener("click",()=>void I(n.keyword));const t=document.getElementById("refreshBtn");t&&t.addEventListener("click",()=>void cs()),document.querySelectorAll("[data-session-id]").forEach(i=>{i.addEventListener("toggle",async o=>{if(!o.target.open)return;const d=o.target.dataset.sessionId;if(!d)return;const u=j.get(d)||await ds(d);if(!u)return;const c=o.target.querySelector(".session-preview");c&&(c.innerHTML=$(u.rawText||"",n.keyword))})})}h();R();setInterval(()=>{R()},6e4);

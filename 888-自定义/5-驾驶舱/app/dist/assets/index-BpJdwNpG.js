(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))e(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const d of i.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&e(d)}).observe(document,{childList:!0,subtree:!0});function a(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function e(n){if(n.ep)return;n.ep=!0;const i=a(n);fetch(n.href,i)}})();const $="未归类",I=new Set(["app","src","dist","node_modules","sessions","archived_sessions","logs"]),M=[["收口","收口阶段"],["验收","验收阶段"],["开发","开发协同"],["联调","开发协同"],["评审","内部评审"],["方案","方案设计"],["需求","需求分析"]],F=[["先收口","先收口"],["先确认","先确认"],["边界","边界收口"],["风险","风险前置"],["评审","评审闭环"],["协同","协同推进"],["复盘","复盘沉淀"]],H=[["边界","边界未清"],["确认","确认待定"],["异常","异常策略"],["返工","返工风险"],["延期","进度风险"],["阻塞","依赖阻塞"]];function K(s){return String(s??"").replace(/\//g,"\\")}function E(s){return K(s).split(/[\\/]+/).map(t=>t.trim()).filter(Boolean)}function P(s){if(!s.length||s.includes(".codex"))return $;const t=s.findIndex(e=>e==="AI项目文档"||e==="AI项目");if(t>=0){const e=[];for(let n=t+1;n<s.length;n+=1){const i=s[n];if(I.has(i))break;if(e.length===0||e.length===1||/^\d+[-_]/.test(i))e.push(i);else break;if(e.length===2)break}if(e.length)return e.join("/")}const a=s.filter(e=>!I.has(e));return a.length>=2?a.slice(-2).join("/"):a[0]||$}function A(s="",t=""){const a=P(E(s));return a!==$?a:P(E(t))}function U(s){if(!s)return"";const t=new Date(s);return Number.isNaN(t.getTime())?"":t.toISOString().slice(0,10)}function y(s={}){const t=["timestamp","created_at","createdAt","updated_at","updatedAt","last_message_at","lastMessageAt","date","time"];for(const a of t){const e=U(s[a]);if(e)return e}return""}function m(s){if(s==null)return"";if(typeof s=="string")return s;if(typeof s=="number"||typeof s=="boolean")return String(s);if(Array.isArray(s))return s.map(m).filter(Boolean).join(`
`);if(typeof s=="object"){const a=["content","text","message","title","prompt","response","name","query","answer","result","output"].map(e=>m(s[e])).filter(Boolean);return a.length?a.join(`
`):Object.values(s).map(m).filter(Boolean).join(`
`)}return""}function z(s){for(const[t,a]of M)if(s.includes(t))return a;return"推进中"}function Y(s){const t=[];for(const[a,e]of F)s.includes(a)&&!t.includes(e)&&t.push(e);return t.slice(0,5)}function G(s){const t=[];for(const[a,e]of H)s.includes(a)&&!t.includes(e)&&t.push(e);return t.slice(0,3)}function S(s){return s.session_id||s.sessionId||s.conversation_id||s.conversationId||s.id||s.message_id||s.messageId||""}function C(s){return String(s.role||s.author_role||s.speaker||s.type||"").toLowerCase()}function b(s){const a=["content","text","message","title","prompt","response","result","output"].map(e=>m(s[e])).filter(Boolean).join(`
`);return a||m(s).trim()}function V(s){const t=String(s||"").split(/\r?\n/).map(e=>e.trim()).filter(Boolean),a=[];for(const e of t)try{a.push(JSON.parse(e))}catch{a.push({type:"text",content:e})}if(!a.length&&String(s||"").trim())try{const e=JSON.parse(s);return Array.isArray(e)?e:[e]}catch{return[{type:"text",content:s}]}return a}function Q(s,t){const a=s.find(e=>S(e));return a?S(a):t}function W(s,t){var p;const a=[...s].sort((l,j)=>{const q=new Date(l.timestamp||l.created_at||l.createdAt||0).getTime(),J=new Date(j.timestamp||j.created_at||j.createdAt||0).getTime();return q-J}),e=a[0]||{},n=a.map(b).filter(Boolean).join(`
`),i=A(e.cwd||e.path||t,e.project||t),d=y(e)||y(a.find(l=>y(l)))||"",u=e.title||e.summary||e.topic||e.name||((p=n.split(`
`).find(Boolean))==null?void 0:p.slice(0,24))||"未命名",c=e.session_id||e.sessionId||e.conversation_id||e.conversationId||t,g=a.filter(l=>C(l).includes("user")||b(l).includes("？")||b(l).includes("?")).length,v=a.filter(l=>C(l).includes("tool")||l.type==="tool"||l.tool||l.tool_name||l.toolName).length,f=Array.from(new Set([...Y(n),i===$?"未归类":"项目"])).slice(0,5);return{sessionId:c,title:u,project:i,date:d,questionCount:g,toolCalls:v,messageCount:a.length,tags:f,stage:z(n),risks:G(n),rawText:n,sourcePath:t,cwd:e.cwd||""}}function R(s=[]){const t=[],a=new Map;s.forEach(n=>{const i=n.path||n.webkitRelativePath||n.name||"",d=V(n.content||""),u=Q(d,i);d.forEach((c,g)=>{const v=S(c)||u,f=b(c),p={id:`${i}:${g}`,sessionId:v,role:C(c)||"text",type:c.type||c.event||"message",title:c.title||"",date:y(c),project:A(c.cwd||i,c.project||""),text:f,sourcePath:i,raw:c};t.push(p),a.has(v)||a.set(v,[]),a.get(v).push({...c,path:i})})});const e=Array.from(a.entries()).map(([n,i])=>{var d;return W(i,((d=i[0])==null?void 0:d.path)||n)}).sort((n,i)=>{const d=new Date(n.date||0).getTime();return new Date(i.date||0).getTime()-d});return{records:t,sessions:e}}function X(s){return new Set(s.map(t=>t.date).filter(Boolean)).size}function Z(s,t){var v,f;const a=t.length,e=t.reduce((p,l)=>p+l.toolCalls,0),n=t.reduce((p,l)=>p+l.questionCount,0),i=Array.from(new Set(t.flatMap(p=>p.risks))).slice(0,3),d=i[0]||"待确认",u=((v=t[0])==null?void 0:v.stage)||"推进中",c=((f=t[0])==null?void 0:f.date)||"",g=Array.from(new Set(t.flatMap(p=>p.tags).filter(Boolean).slice(0,6)));return{name:s,stage:u,progress:Math.min(96,32+a*7+e),sessionCount:a,toolCalls:e,questionCount:n,lastDate:c,keywords:g,issue:d,risks:i,work:t.slice(0,3).map(p=>p.title),value:a>1?"推进中枢":"单点收口",method:g.slice(0,2).join(" / ")||"边界收口"}}function ss(s){return s.map(t=>({id:t.sessionId,title:t.title,project:t.project,date:t.date,tags:t.tags,text:[t.title,t.rawText,t.project,t.tags.join(" ")].join(" "),rawText:t.rawText,stage:t.stage,risks:t.risks,toolCalls:t.toolCalls}))}function B({sessions:s=[],records:t=[]}={}){const a=new Map;s.forEach(u=>{const c=u.project||$;a.has(c)||a.set(c,[]),a.get(c).push(u)});const e=Array.from(a.entries()).map(([u,c])=>Z(u,c.sort((g,v)=>new Date(v.date||0)-new Date(g.date||0)))).sort((u,c)=>c.sessionCount-u.sessionCount),n={sessionCount:s.length,recordCount:t.length,projectCount:e.length,toolCount:s.reduce((u,c)=>u+c.toolCalls,0),activeDays:X(s)},i=e[0]||{name:"未导入",stage:"待导入",progress:0,sessionCount:0,toolCalls:0,questionCount:0,lastDate:"",keywords:[],issue:"等待导入目录",work:[],value:"等待数据",method:"等待数据"},d=ss(s);return{summary:n,focusProject:i,projects:e,sessions:s,records:t,searchIndex:d}}function ts(s=[],t=""){const a=String(t||"").trim().toLowerCase();return a?s.filter(e=>[e.title,e.project,e.date,e.text,...e.tags||[]].filter(Boolean).join(" ").toLowerCase().includes(a)):s}const D=[{id:"home",label:"首页"},{id:"search",label:"对话检索"},{id:"projects",label:"项目详情"},{id:"reports",label:"月报生成"},{id:"settings",label:"设置"}],L=[{path:"sessions/2026/04/2026-04-30.jsonl",content:[JSON.stringify({session_id:"demo-001",role:"user",content:"纸张管理项目首页改成聚焦项目。",timestamp:"2026-04-30T09:00:00+08:00",cwd:"D:\\文档\\JTY\\AI项目文档\\888-自定义\\5-驾驶舱"}),JSON.stringify({role:"assistant",content:"已收紧首页层级，移除解释文案。",timestamp:"2026-04-30T09:01:00+08:00"}),JSON.stringify({type:"tool",name:"shell_command",content:"Get-ChildItem",timestamp:"2026-04-30T09:02:00+08:00"})].join(`
`)},{path:"sessions/2026/04/2026-04-29.jsonl",content:[JSON.stringify({session_id:"demo-002",title:"月报结构",role:"user",content:"按项目输出月报，保留原文，支持搜索。",timestamp:"2026-04-29T18:10:00+08:00",cwd:"D:\\文档\\JTY\\AI项目文档\\888-自定义\\5-驾驶舱"}),JSON.stringify({role:"assistant",content:"月报保留项目、数据、价值、方法。",timestamp:"2026-04-29T18:11:00+08:00"})].join(`
`)},{path:"session_index.jsonl",content:[JSON.stringify({session_id:"demo-idx",title:"驾驶舱原型",cwd:"D:\\文档\\JTY\\AI项目文档\\888-自定义\\5-驾驶舱",created_at:"2026-04-28T08:30:00+08:00",project:"888-自定义/5-驾驶舱"})].join(`
`)}],es=[["主数据源","本机文件导入"],["项目目录","888-自定义/5-驾驶舱"],["自动刷新","17:00 / 23:00"],["原文","默认折叠"]],r={activeTab:"home",keyword:"",dashboard:B(R(L)),sourceRoot:"C:\\Users\\zbb09\\.codex",status:"本机自动识别",lastRefresh:new Date,reportProject:"",loading:!1},as=document.getElementById("app");function k(s){return String(s).padStart(2,"0")}function O(s){return`${k(s.getHours())}:${k(s.getMinutes())}:${k(s.getSeconds())}`}function o(s){return String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function ns(s){return String(s).replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function w(s,t){const a=o(s),e=String(t||"").trim();return e?a.replace(new RegExp(ns(e),"ig"),n=>`<mark>${n}</mark>`):a}function N(s){return`<div class="progress"><span style="width:${Math.max(0,Math.min(100,s))}%"></span></div>`}function T(s){return r.dashboard.sessions.filter(t=>t.project===s)}function is(){return r.dashboard.projects.find(s=>s.name===r.reportProject)||r.dashboard.projects[0]||null}async function x(){try{const s=await fetch("/api/dashboard",{cache:"no-store"});if(!s.ok)throw new Error(`HTTP ${s.status}`);const t=await s.json();r.dashboard=t.dashboard,r.sourceRoot=t.sourceRoot,r.status=t.status,r.lastRefresh=new Date(t.lastRefresh),!r.reportProject&&r.dashboard.projects[0]&&(r.reportProject=r.dashboard.projects[0].name)}catch{r.status="后端未启动，当前显示示例数据",r.dashboard=B(R(L)),r.lastRefresh=new Date,!r.reportProject&&r.dashboard.projects[0]&&(r.reportProject=r.dashboard.projects[0].name)}h()}async function rs(){r.loading=!0,h();try{await fetch("/api/refresh",{method:"POST"}),await x()}finally{r.loading=!1}}function os(s){const t=["需求","方案","评审","协同","收口"],a=t.findIndex(e=>String(s).includes(e));return t.map((e,n)=>({label:e,active:a>=0?n<=a:n===0}))}function _(){var e,n;const s=r.dashboard.focusProject,t=T(s.name).slice(0,3),a=os(s.stage);return`
    <section class="tab-panel home-shell">
      <div class="card section home-banner">
        <div class="decision-badges">
          <span class="tag hot">主项目 ${o(s.name)}</span>
          <span class="tag blue">阶段 ${o(s.stage)}</span>
          <span class="tag">自动刷新 ${O(r.lastRefresh)}</span>
        </div>
      </div>

      <div class="home-grid-top">
        <div class="card section home-main">
          <div class="section-head">
            <h3>主项目</h3>
            <span class="meta">${o(s.lastDate||"—")}</span>
          </div>
          <div class="project-name">${o(s.name)}</div>
          <div class="project-stage">${o(s.stage)}</div>
          <div class="project-flow">
            <div class="flow-step active"><strong>会话</strong><span>${s.sessionCount}</span></div>
            <div class="flow-step active"><strong>提问</strong><span>${s.questionCount}</span></div>
            <div class="flow-step active"><strong>工具</strong><span>${s.toolCalls}</span></div>
            <div class="flow-step active"><strong>进度</strong><span>${s.progress}%</span></div>
          </div>
          ${N(s.progress)}
          <div class="micro-kpis">
            <div class="micro-kpi"><div class="label">工作</div><div class="value">${s.work.length}</div></div>
            <div class="micro-kpi"><div class="label">方法</div><div class="value">${s.method?1:0}</div></div>
            <div class="micro-kpi"><div class="label">风险</div><div class="value">${((e=s.risks)==null?void 0:e.length)||0}</div></div>
            <div class="micro-kpi"><div class="label">会话</div><div class="value">${r.dashboard.summary.sessionCount}</div></div>
          </div>
        </div>

        <div class="home-side">
          <div class="card section">
            <div class="section-head"><h3>判断</h3></div>
            <div class="decision-track grid-2">
              <div class="decision-step active"><strong>状态</strong><span>${o(s.stage)}</span></div>
              <div class="decision-step"><strong>结果</strong><span>${o(s.value)}</span></div>
              <div class="decision-step"><strong>方法</strong><span>${o(s.method)}</span></div>
              <div class="decision-step"><strong>关键</strong><span>${o(s.issue)}</span></div>
            </div>
          </div>
          <div class="card section">
            <div class="section-head"><h3>阻塞</h3></div>
            <div class="risk-list">
              ${((n=s.risks)!=null&&n.length?s.risks:[s.issue]).map((i,d)=>`
                <div class="risk-item">
                  <span class="dot"></span>
                  <strong>${o(i)}</strong>
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
            ${t.map(i=>`
              <details class="evidence-node">
                <summary>
                  <div class="badge">${o(i.date||"—")}</div>
                  <div><strong>${o(i.title)}</strong></div>
                </summary>
                <pre>${w(i.rawText,r.keyword)}</pre>
              </details>
            `).join("")}
          </div>
        </div>
        <div class="card section">
          <div class="section-head"><h3>周期</h3></div>
          <div class="cycle-bar">
            ${a.map(i=>`
              <div class="cycle ${i.active?"active":""}">
                <strong>${i.label}</strong>
                <span>${i.active?"进行中":"待命"}</span>
              </div>
            `).join("")}
          </div>
        </div>
        <div class="card section">
          <div class="section-head"><h3>方法</h3></div>
          <div class="method-cloud">
            ${(s.tags||[]).map(i=>`<span class="pill">${o(i)}</span>`).join("")}
          </div>
        </div>
      </div>
    </section>
  `}function cs(){const s=ts(r.dashboard.searchIndex,r.keyword);return`
    <section class="tab-panel page-grid search-layout">
      <div class="card section filters">
        <div class="section-head"><h3>筛选</h3></div>
        <label>关键词<input id="searchInput" value="${o(r.keyword)}" placeholder="搜索项目 / 原文" /></label>
        <button class="primary" id="searchBtn">搜索</button>
      </div>
      <div class="search-list">
        ${s.map(t=>`
          <details class="card section search-card">
            <summary>
              <div class="item-head">
                <strong>${w(t.title,r.keyword)}</strong>
                <span class="tag blue">${o(t.project)}</span>
              </div>
              <div class="tags">
                <span class="tag">${o(t.date||"—")}</span>
                <span class="tag hot">工具 ${t.toolCalls||0}</span>
                ${(t.tags||[]).map(a=>`<span class="tag">${o(a)}</span>`).join("")}
              </div>
            </summary>
            <pre>${w(t.rawText,r.keyword)}</pre>
          </details>
        `).join("")}
      </div>
    </section>
  `}function ds(){return`
    <section class="tab-panel page-grid project-grid">
      ${r.dashboard.projects.map(s=>{const t=T(s.name);return`
          <div class="card section">
            <div class="project-head">
              <strong>${o(s.name)}</strong>
              <span class="tag ${s.stage.includes("评审")?"hot":"blue"}">${o(s.stage)}</span>
            </div>
            ${N(s.progress)}
            <div class="tags">
              <span class="tag hot">会话 ${s.sessionCount}</span>
              <span class="tag blue">提问 ${s.questionCount}</span>
              <span class="tag">工具 ${s.toolCalls}</span>
              <span class="tag">${o(s.lastDate||"—")}</span>
            </div>
            <div class="list">
              <div class="item"><strong>工作</strong><div class="muted">${o(s.work.join(" / ")||"—")}</div></div>
              <div class="item"><strong>价值</strong><div class="muted">${o(s.value)}</div></div>
              <div class="item"><strong>方法</strong><div class="muted">${o(s.method)}</div></div>
              <div class="item"><strong>阻塞</strong><div class="muted">${o(s.issue)}</div></div>
            </div>
            <details class="search-card">
              <summary>原文</summary>
              <div class="list">
                ${t.slice(0,3).map(a=>`
                  <details class="mini-session">
                    <summary>
                      <span>${o(a.date||"—")}</span>
                      <strong>${o(a.title)}</strong>
                    </summary>
                    <pre>${w(a.rawText,r.keyword)}</pre>
                  </details>
                `).join("")}
              </div>
            </details>
          </div>
        `}).join("")}
    </section>
  `}function ls(){var e,n;const s=is(),t=s?T(s.name):[],a=s?[`项目名称：${s.name}`,`统计周期：${((e=t.at(-1))==null?void 0:e.date)||"—"} - ${((n=t[0])==null?void 0:n.date)||"—"}`,"","1. 项目概述",`- 阶段：${s.stage}`,`- 当前状态：${s.value}`,"","2. 本期工作",...s.work.length?s.work:["- 待补充"],"","3. 数据支撑",`- 会话数：${s.sessionCount}`,`- 提问数：${s.questionCount}`,`- 工具调用数：${s.toolCalls}`,`- 原文条数：${t.length}`,"","4. 工作价值",`- 推进结果：${s.value}`,`- 关键判断：${s.issue}`,"","5. 方法论沉淀",`- 复用做法：${s.method}`,`- 风险识别：${(s.risks||["待确认"]).join(" / ")}`,"","6. 遗留问题",`- 当前阻塞：${s.issue}`].join(`
`):"暂无数据";return`
    <section class="tab-panel page-grid reports-layout">
      <div class="card section">
        <div class="section-head"><h3>项目</h3><span class="meta">按项目输出</span></div>
        <div class="list">
          ${r.dashboard.projects.map(i=>`
            <button class="project-select ${i.name===(s==null?void 0:s.name)?"active":""}" data-project="${o(i.name)}">
              <strong>${o(i.name)}</strong>
              <span>${o(i.stage)}</span>
            </button>
          `).join("")}
        </div>
      </div>
      <div class="card section report-area">
        <div class="section-head"><h3>月报</h3><span class="meta">${o((s==null?void 0:s.name)||"—")}</span></div>
        <pre class="report-editor">${o(a)}</pre>
      </div>
    </section>
  `}function us(){return`
    <section class="tab-panel page-grid settings-layout">
      <div class="card section">
        <div class="section-head"><h3>数据源</h3><span class="meta">本机自动识别</span></div>
        <div class="list">
          ${es.map(([s,t])=>`
            <div class="item">
              <strong>${o(s)}</strong>
              <div class="muted">${o(t)}</div>
            </div>
          `).join("")}
          <div class="item"><strong>根目录</strong><div class="muted">${o(r.sourceRoot)}</div></div>
          <div class="item"><strong>状态</strong><div class="muted">${o(r.status)}</div></div>
        </div>
      </div>
      <div class="card section">
        <div class="section-head"><h3>统计</h3><span class="meta">当前状态</span></div>
        <div class="micro-kpis">
          <div class="micro-kpi"><div class="label">会话</div><div class="value">${r.dashboard.summary.sessionCount}</div></div>
          <div class="micro-kpi"><div class="label">原文</div><div class="value">${r.dashboard.summary.recordCount}</div></div>
          <div class="micro-kpi"><div class="label">项目</div><div class="value">${r.dashboard.summary.projectCount}</div></div>
          <div class="micro-kpi"><div class="label">活跃天</div><div class="value">${r.dashboard.summary.activeDays}</div></div>
        </div>
      </div>
    </section>
  `}function ps(){switch(r.activeTab){case"home":return _();case"search":return cs();case"projects":return ds();case"reports":return ls();case"settings":return us();default:return _()}}function h(){var s;as.innerHTML=`
    <div class="shell">
      <aside class="sidebar">
        <div class="brand">
          <h1>Codex 工作驾驶舱</h1>
        </div>
        <div class="nav">
          ${D.map(t=>`
            <button class="${t.id===r.activeTab?"active":""}" data-tab="${t.id}">
              ${t.label}
            </button>
          `).join("")}
        </div>
        <div class="sidebar-card">
          <div class="row"><span><span class="status-dot"></span>自动刷新</span><strong>17:00 / 23:00</strong></div>
          <div class="row"><span>数据源</span><strong>本机自动</strong></div>
          <div class="row"><span>刷新</span><strong>${O(r.lastRefresh)}</strong></div>
        </div>
        <div class="sidebar-card">
          <strong>${o(r.status)}</strong>
        </div>
      </aside>

      <main class="main">
        <div class="topbar">
          <div class="title">
            <h2>${((s=D.find(t=>t.id===r.activeTab))==null?void 0:s.label)||"首页"}</h2>
          </div>
          <div class="toolbar">
            <input id="globalSearch" type="text" value="${o(r.keyword)}" placeholder="搜索项目 / 原文 / 标签" />
            <button class="ghost" id="refreshBtn">${r.loading?"刷新中":"刷新"}</button>
          </div>
        </div>
        <div class="content">${ps()}</div>
      </main>
    </div>
  `,vs()}function vs(){document.querySelectorAll(".nav button").forEach(n=>{n.addEventListener("click",()=>{r.activeTab=n.dataset.tab,h()})});const s=document.getElementById("globalSearch");s&&s.addEventListener("input",n=>{r.keyword=n.target.value.trim(),h()}),document.querySelectorAll("[data-project]").forEach(n=>{n.addEventListener("click",()=>{r.reportProject=n.dataset.project,h()})});const t=document.getElementById("searchInput");t&&t.addEventListener("input",n=>{r.keyword=n.target.value.trim(),h()});const a=document.getElementById("searchBtn");a&&a.addEventListener("click",()=>h());const e=document.getElementById("refreshBtn");e&&e.addEventListener("click",()=>void rs())}h();x();setInterval(()=>{x()},6e4);

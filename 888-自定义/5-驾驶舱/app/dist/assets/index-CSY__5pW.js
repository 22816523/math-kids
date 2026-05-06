(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))c(a);new MutationObserver(a=>{for(const n of a)if(n.type==="childList")for(const e of n.addedNodes)e.tagName==="LINK"&&e.rel==="modulepreload"&&c(e)}).observe(document,{childList:!0,subtree:!0});function d(a){const n={};return a.integrity&&(n.integrity=a.integrity),a.referrerPolicy&&(n.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?n.credentials="include":a.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function c(a){if(a.ep)return;a.ep=!0;const n=d(a);fetch(a.href,n)}})();const u=[{id:"home",label:"首页驾驶舱"},{id:"search",label:"对话检索"},{id:"projects",label:"项目详情"},{id:"reports",label:"月报生成"},{id:"settings",label:"设置"}],o={name:"3-纸张管理扫码出入库",stage:"内部评审",progress:78,metrics:[{label:"会话",value:62},{label:"风险",value:2},{label:"方法论",value:5},{label:"下一步",value:1}],flow:[{name:"需求收集",state:"完成"},{name:"需求分析",state:"完成"},{name:"方案设计",state:"收敛中",active:!0},{name:"内部评审",state:"当前"}],judgment:[{label:"问题",value:"边界未清"},{label:"判断",value:"先收口",active:!0},{label:"动作",value:"补齐确认"},{label:"结果",value:"进入协同"}],blockers:[{name:"业务确认未闭环",rank:1},{name:"异常策略未定",rank:2},{name:"范围容易外扩",rank:3}],evidence:[{tag:"原文",text:"需求边界需要再确认"},{tag:"材料",text:"内部评审问题清单"},{tag:"结论",text:"先收口，再协同"}],cycle:[{name:"需求收集",active:!1},{name:"方案设计",active:!0},{name:"内部评审",active:!0},{name:"开发协同",active:!1}],methods:["先对齐边界","风险前置","先收口再扩展","评审问题单独闭环","异常策略先定"]},h=[{title:"纸张管理迭代需求文档",project:"3-纸张管理扫码出入库",date:"2026-03-18",tags:["原文折叠","展开"]},{title:"自动刷新与本机常驻",project:"设置",date:"2026-03-20",tags:["17:00","23:00","高亮"]}],f=[{name:"3-纸张管理扫码出入库",stage:"内部评审",progress:74,work:["梳理 / 调整 / 确认"],stats:"会话 62 / 提问 128 / 工具 74",value:"收口",method:"先对齐边界",issue:"接口联调"},{name:"4-自动转单升级",stage:"方案设计",progress:52,work:["链路 / 校验点"],stats:"会话 41 / 提问 83 / 工具 44",value:"减少返工",method:"逐层验证",issue:"异常策略"}],b=`项目名称：3-纸张管理扫码出入库
统计周期：2026-04

1. 项目概述
- 目标：收口
- 范围：梳理 / 修改 / 闭环
- 状态：评审

2. 项目周期
- 起始时间：2026-03-18
- 当前阶段：内部评审
- 已持续时长：13 天
- 里程碑：确认 / 初稿 / 修改

3. 本期工作
- 梳理库存流转异常
- 调整扫码入库步骤
- 完成确认

4. 数据支撑
- 会话数：62
- 提问数：128
- 工具调用数：74
- 活跃天数：18
- 关联子事项数：9

5. 工作价值
- 推进结果：收口
- 解决问题：卡点
- 降低成本：沟通
- 形成沉淀：方法论

6. 方法论沉淀
- 做法：对齐目标
- 沟通：问题-动作-结果
- 排查：逐层验证
- 风险：看边界

7. 遗留问题
- 未闭环：接口联调
- 风险：异常流程
- 下月：开发协同`,$=[["主数据源","C:\\Users\\zbb09\\.codex"],["项目目录","D:\\文档\\JTY\\AI项目文档\\888-自定义\\5-驾驶舱"],["自动刷新","17:00 / 23:00"],["字段","结果 / 影响 / 方法论标签"]],i={activeTab:"home",keyword:"",importedFiles:0,lastRefresh:new Date,refreshMarkers:[]},y=document.getElementById("app");function p(s){return String(s).padStart(2,"0")}function w(s){return`${p(s.getHours())}:${p(s.getMinutes())}:${p(s.getSeconds())}`}function m(s){return`<div class="progress"><span style="width:${s}%"></span></div>`}function g(){const s=o.flow.map((e,v)=>`
    <div class="flow-step ${e.active?"active":""}">
      <strong>${e.name}</strong>
      <span>${e.state}</span>
    </div>
  `).join(""),t=o.judgment.map(e=>`
    <div class="decision-step ${e.active?"active":""}">
      <strong>${e.label}</strong>
      <span>${e.value}</span>
    </div>
  `).join(""),d=o.blockers.map(e=>`
    <div class="risk-item">
      <span class="dot"></span>
      <strong>${e.name}</strong>
      <span>${e.rank}</span>
    </div>
  `).join(""),c=o.evidence.map(e=>`
    <div class="evidence-node">
      <div class="badge">${e.tag}</div>
      <div><strong>${e.text}</strong></div>
    </div>
  `).join(""),a=o.cycle.map(e=>`
    <div class="cycle ${e.active?"active":""}">
      <strong>${e.name}</strong>
    </div>
  `).join(""),n=o.methods.map(e=>`<span class="pill">${e}</span>`).join("");return`
    <section class="home-shell">
      <div class="card section home-banner">
        <div class="eyebrow">个人工作中枢</div>
        <div class="decision-badges">
          <span class="tag hot">主项目：${o.name}</span>
          <span class="tag blue">阶段：${o.stage}</span>
          <span class="tag">判断：先收口再协同</span>
        </div>
      </div>

      <div class="home-grid-top">
        <div class="card section home-main">
          <div class="section-head">
            <h3>当前主项目</h3>
          </div>
          <div class="project-name">${o.name}</div>
          <div class="project-stage">${o.stage}</div>
          <div class="project-flow">${s}</div>
          ${m(o.progress)}
          <div class="micro-kpis">
            ${o.metrics.map(e=>`
              <div class="micro-kpi">
                <div class="label">${e.label}</div>
                <div class="value">${e.value}</div>
              </div>
            `).join("")}
          </div>
        </div>

        <div class="home-side">
          <div class="card section">
            <div class="section-head"><h3>当前判断</h3></div>
            <div class="decision-track grid-2">${t}</div>
          </div>
          <div class="card section">
            <div class="section-head"><h3>当前阻塞</h3></div>
            <div class="risk-list">${d}</div>
          </div>
        </div>
      </div>

      <div class="home-grid-bottom">
        <div class="card section">
          <div class="section-head"><h3>证据</h3></div>
          <div class="evidence-path">${c}</div>
        </div>
        <div class="card section">
          <div class="section-head"><h3>项目周期</h3></div>
          <div class="cycle-bar">${a}</div>
        </div>
        <div class="card section">
          <div class="section-head"><h3>方法论</h3></div>
          <div class="method-cloud">${n}</div>
        </div>
      </div>
    </section>
  `}function k(){const s=h.filter(t=>i.keyword?`${t.title} ${t.project} ${t.date} ${t.tags.join(" ")}`.includes(i.keyword):!0);return`
    <section class="page-grid search-layout">
      <div class="card section filters">
        <div class="section-head"><h3>筛选条件</h3></div>
        <label>关键词<input id="searchInput" value="${i.keyword}" placeholder="输入关键词" /></label>
        <label>项目<select><option>全部项目</option><option>3-纸张管理扫码出入库</option><option>4-自动转单升级</option></select></label>
        <label>日期<select><option>本月</option><option>近7天</option><option>自定义</option></select></label>
        <label>标签<select><option>全部</option><option>方法论</option><option>风险</option><option>价值</option></select></label>
        <button class="primary" id="searchBtn">执行搜索</button>
      </div>
      <div class="search-list">
        ${s.map(t=>`
          <div class="card section">
            <div class="item-head"><strong>${t.title}</strong><span class="tag blue">${t.project}</span></div>
            <div class="tags">
              <span class="tag">${t.date}</span>
              ${t.tags.map(d=>`<span class="tag ${d==="高亮"?"hot":""}">${d}</span>`).join("")}
            </div>
          </div>
        `).join("")}
      </div>
    </section>
  `}function j(){return`
    <section class="page-grid project-grid">
      ${f.map(s=>`
        <div class="card section">
          <div class="project-head"><strong>${s.name}</strong><span class="tag ${s.stage==="内部评审"?"hot":"blue"}">${s.stage}</span></div>
          ${m(s.progress)}
          <div class="list">
            <div class="item"><strong>本期工作</strong><span class="muted">${s.work.join(" / ")}</span></div>
            <div class="item"><strong>数据支撑</strong><span class="muted">${s.stats}</span></div>
            <div class="item"><strong>工作价值</strong><span class="muted">${s.value}</span></div>
            <div class="item"><strong>方法论</strong><span class="muted">${s.method}</span></div>
            <div class="item"><strong>遗留问题</strong><span class="muted">${s.issue}</span></div>
          </div>
        </div>
      `).join("")}
    </section>
  `}function E(){return`
    <section class="page-grid reports-layout">
      <div class="card section report-area">
        <div class="section-head"><h3>月报生成器</h3><span class="meta">按项目输出</span></div>
        <pre class="report-editor">${b}</pre>
      </div>
      <div class="card section">
        <div class="section-head"><h3>项目汇报结构</h3><span class="meta">总览 / 分节 / 跨项</span></div>
        <div class="list">
          <div class="item"><strong>月度总览</strong><span class="muted">会话 184 / 项目 6 / 跨项 5</span></div>
          <div class="item"><strong>按项目展开</strong><span class="muted">周期 / 工作 / 数据 / 价值 / 方法论 / 遗留</span></div>
          <div class="item"><strong>跨项目事项</strong><span class="muted">单列</span></div>
        </div>
      </div>
    </section>
  `}function B(){return`
    <section class="page-grid settings-layout">
      <div class="card section">
        <div class="section-head"><h3>数据源配置</h3><span class="meta">本机目录授权</span></div>
        <div class="list">
          ${$.map(([s,t])=>`
            <div class="item"><strong>${s}</strong><div class="muted">${t}</div></div>
          `).join("")}
          <div class="item"><strong>导入目录</strong><div class="muted">${i.importedFiles} 个文件</div></div>
        </div>
      </div>
      <div class="card section">
        <div class="section-head"><h3>字段规则</h3><span class="meta">最小可用</span></div>
        <div class="tags">
          <span class="tag hot">结果</span>
          <span class="tag hot">影响</span>
          <span class="tag hot">方法论标签</span>
          <span class="tag blue">项目名</span>
          <span class="tag blue">原文</span>
          <span class="tag warn">风险模式</span>
        </div>
      </div>
    </section>
  `}function I(){switch(i.activeTab){case"home":return g();case"search":return k();case"projects":return j();case"reports":return E();case"settings":return B();default:return g()}}function r(){var s;y.innerHTML=`
    <div class="shell">
      <aside class="sidebar">
        <div class="brand">
          <h1>Codex 工作驾驶舱</h1>
        </div>
        <div class="nav">
          ${u.map(t=>`
            <button class="${t.id===i.activeTab?"active":""}" data-tab="${t.id}">${t.label}</button>
          `).join("")}
        </div>
        <div class="sidebar-card">
          <div class="row"><span><span class="status-dot"></span>自动刷新</span><strong>17:00 / 23:00</strong></div>
          <div class="row"><span>数据源</span><strong>${Math.max(2,i.importedFiles?1:2)} 份</strong></div>
          <div class="row"><span>刷新时间</span><strong>${w(i.lastRefresh)}</strong></div>
        </div>
        <div class="sidebar-card">
          <strong>888-自定义/5-驾驶舱</strong>
        </div>
      </aside>

      <main class="main">
        <div class="topbar">
          <div class="title">
            <h2>${((s=u.find(t=>t.id===i.activeTab))==null?void 0:s.label)??"首页驾驶舱"}</h2>
          </div>
          <div class="toolbar">
            <input id="globalSearch" type="text" value="${i.keyword}" placeholder="搜索项目 / 关键词 / 原文 / 方法论标签" />
            <button class="ghost" id="refreshBtn">手动刷新</button>
            <button class="primary" id="importBtn">导入目录</button>
            <input id="folderInput" type="file" webkitdirectory multiple hidden />
          </div>
        </div>
        <div class="content">${I()}</div>
      </main>
    </div>
  `,T()}function l(){i.refreshMarkers.length&&i.refreshMarkers.forEach(clearTimeout);const s=new Date,t=[17,23].map(d=>{const c=new Date(s);return c.setHours(d,0,0,0),c<=s&&c.setDate(c.getDate()+1),c});i.refreshMarkers=t.map(d=>setTimeout(()=>{i.lastRefresh=new Date,r(),l()},d.getTime()-s.getTime()))}function T(){document.querySelectorAll(".nav button").forEach(e=>{e.addEventListener("click",()=>{i.activeTab=e.dataset.tab,r()})});const s=document.getElementById("globalSearch");s&&s.addEventListener("input",e=>{i.keyword=e.target.value.trim(),r()});const t=document.getElementById("searchInput");t&&t.addEventListener("input",e=>{i.keyword=e.target.value.trim(),r()});const d=document.getElementById("searchBtn");d&&d.addEventListener("click",()=>r());const c=document.getElementById("refreshBtn");c&&c.addEventListener("click",()=>{i.lastRefresh=new Date,r(),l()});const a=document.getElementById("importBtn"),n=document.getElementById("folderInput");a&&n&&(a.addEventListener("click",()=>n.click()),n.addEventListener("change",e=>{var v;i.importedFiles=((v=e.target.files)==null?void 0:v.length)??0,i.lastRefresh=new Date,r(),l()}))}r();l();

const fs = require('fs');
const path = require('path');

const softwareName = '儿童数学启蒙互动学习系统';
const shortName = '数学启蒙';
const version = 'V1.0';
const outputHtml = path.join(__dirname, '文档鉴别材料.html');
const outputMeta = path.join(__dirname, '文档鉴别材料-说明.json');
const screenshotDir = path.join(__dirname, 'screenshots');

function imageData(fileName) {
  const fullPath = path.join(screenshotDir, fileName);
  const buffer = fs.readFileSync(fullPath);
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

const screenshots = {
  index: imageData('index.png'),
  baisu: imageData('baisu.png'),
  math: imageData('math.png'),
  measure: imageData('measure.png'),
  shape: imageData('shape.png'),
  sudoku: imageData('sudoku.png'),
  trace: imageData('trace.png'),
  settings: imageData('settings.png'),
};

const detailedDir = path.join(__dirname, 'screenshots-detailed');
function detailedImage(fileName) {
  return `data:image/png;base64,${fs.readFileSync(path.join(detailedDir, fileName)).toString('base64')}`;
}

const detailed = {
  baisuOrder: detailedImage('baisu-order.png'),
  baisuNeighbor: detailedImage('baisu-neighbor.png'),
  baisuNinegrid: detailedImage('baisu-ninegrid.png'),
  baisuPattern: detailedImage('baisu-pattern.png'),
  baisuTreasure: detailedImage('baisu-treasure.png'),
  measureClock: detailedImage('measure-clock.png'),
  measureMoney: detailedImage('measure-money.png'),
  measureCompare: detailedImage('measure-compare.png'),
  measureLength: detailedImage('measure-length.png'),
  measureWeight: detailedImage('measure-weight.png'),
  measureCalendar: detailedImage('measure-calendar.png'),
  shapeRecognize: detailedImage('shape-recognize.png'),
  shapeClassify: detailedImage('shape-classify.png'),
  shapeFind: detailedImage('shape-find.png'),
  shapeTangram: detailedImage('shape-tangram.png'),
  shapeSpatial: detailedImage('shape-spatial.png'),
  mathLevel1: detailedImage('math-level1.png'),
  mathLevel2: detailedImage('math-level2.png'),
  mathLevel3: detailedImage('math-level3.png'),
  sudoku4Easy: detailedImage('sudoku-4x4-easy.png'),
  sudoku4Advanced: detailedImage('sudoku-4x4-advanced.png'),
  sudoku6Easy: detailedImage('sudoku-6x6-easy.png'),
  sudoku6Advanced: detailedImage('sudoku-6x6-advanced.png'),
  sudoku9Easy: detailedImage('sudoku-9x9-easy.png'),
  sudoku9Advanced: detailedImage('sudoku-9x9-advanced.png'),
  traceDefault: detailedImage('trace-default.png'),
  settingsDefault: detailedImage('settings-default.png'),
  indexDefault: detailedImage('index-default.png'),
};

function sectionList(items) {
  return `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
}

function paragraphList(items) {
  return items.map((item) => `<p>${item}</p>`).join('');
}

function twoCol(leftTitle, leftBody, rightTitle, rightBody) {
  return `
    <div class="two-col">
      <div class="card">
        <h3>${leftTitle}</h3>
        ${leftBody}
      </div>
      <div class="card">
        <h3>${rightTitle}</h3>
        ${rightBody}
      </div>
    </div>`;
}

function screenshotBlock(title, dataUrl, caption) {
  return `
    <div class="screenshot-card">
      <div class="screenshot-title">${title}</div>
      <img src="${dataUrl}" alt="${title}">
      <div class="screenshot-caption">${caption}</div>
    </div>`;
}

function gallery(items) {
  return `<div class="gallery-grid">${items.join('')}</div>`;
}

const pages = [
  {
    title: '软件说明书',
    subtitle: '封面',
    content: `
      <div class="cover">
        <div class="cover-kicker">计算机软件著作权登记文档鉴别材料</div>
        <h1>${softwareName}</h1>
        <div class="cover-version">版本号：${version}</div>
        <div class="cover-meta">
          <div>软件简称：${shortName}</div>
          <div>软件分类：应用软件</div>
          <div>技术特点：教育软件</div>
          <div>编程语言：JavaScript、HTML</div>
        </div>
      </div>`,
  },
  {
    title: '文档说明',
    subtitle: '第1章 文档用途',
    content: paragraphList([
      `${softwareName}为面向儿童数学启蒙学习场景开发的交互式学习软件。本说明书用于软件著作权登记中的文档鉴别材料提交，主要说明软件的开发背景、运行环境、主要功能、技术方案和界面表现形式。`,
      `本软件采用网页前端方式实现，围绕百数板、加减法、图形与几何、常见的量、数独和数字描红等数学启蒙模块构建完整的互动练习体验，适配桌面浏览器和平板浏览器运行。`,
      `文档中的软件截图、功能说明和技术描述与当前申报版本保持一致，软件全称统一为“${softwareName}”，版本统一为“${version}”。`,
    ]) + sectionList([
      '文档类型：软件说明书',
      '交存方式：一般交存',
      '说明对象：儿童数学启蒙互动学习系统',
      '文档用途：软件著作权登记',
    ]),
  },
  {
    title: '软件概述',
    subtitle: '第2章 软件定位',
    content: twoCol(
      '产品定位',
      paragraphList([
        `${softwareName}是一款服务于低龄儿童数学认知和基础练习的软件，强调图形化界面、轻量化操作和正向反馈机制。`,
        '软件围绕幼小衔接和启蒙数学常见场景设计交互方式，使儿童在较少文字依赖的前提下也能够完成练习。',
      ]),
      '目标用户',
      sectionList([
        '3至8岁儿童',
        '幼小衔接阶段学习者',
        '家长陪伴式训练场景',
        '平板与浏览器环境下的轻量学习场景',
      ]),
    ),
  },
  {
    title: '开发目的',
    subtitle: '第3章 建设目标',
    content: paragraphList([
      '本软件的开发目的在于为儿童提供一套结构清晰、交互直观、反馈及时的数学启蒙工具，以帮助儿童在数字、图形、计量、逻辑等多个维度建立基础认知。',
      '相较于传统纸面练习，软件通过触控拖拽、语音提示、即时反馈和可视化练习机制增强学习兴趣，降低入门门槛，提升重复训练效率。',
      '软件以离线可运行、无复杂安装、适配移动端为目标，方便在家庭和教学辅助场景中部署和使用。',
    ]) + sectionList([
      '目标一：建立基础数学认知能力',
      '目标二：提升儿童独立操作能力',
      '目标三：通过互动机制增强学习兴趣',
      '目标四：兼顾浏览器跨平台运行能力',
    ]),
  },
  {
    title: '行业领域',
    subtitle: '第4章 应用场景',
    content: twoCol(
      '面向行业',
      sectionList([
        '教育行业',
        '儿童启蒙教育',
        '家庭教育辅助',
        '素质教育训练场景',
      ]),
      '应用场景',
      sectionList([
        '家庭陪伴学习',
        '幼儿园及启蒙机构辅助教学',
        '平板端自主练习',
        '数学基础能力巩固训练',
      ]),
    ) + paragraphList([
      '软件围绕“学、练、巩固”的启蒙学习链路组织内容，适合在短时、高频、碎片化的练习场景中使用。',
    ]),
  },
  {
    title: '环境说明',
    subtitle: '第5章 开发与运行环境',
    content: twoCol(
      '开发环境',
      sectionList([
        '开发硬件环境：PC兼容机，Intel/AMD x64处理器，8GB以上内存',
        '开发操作系统：Windows 10/11',
        '开发工具：Visual Studio Code、Git、Node.js、Playwright',
        '开发语言：JavaScript、HTML5、CSS3',
      ]),
      '运行环境',
      sectionList([
        '运行硬件环境：PC、平板电脑',
        '运行平台：现代Web浏览器',
        '支持系统：Windows、Android、iOS、iPadOS',
        '运行支撑环境：Chrome、Edge、Safari等浏览器',
      ]),
    ),
  },
  {
    title: '总体架构',
    subtitle: '第6章 系统组成',
    content: sectionList([
      '入口页面：负责模块导航、主页布局和设置入口',
      '功能模块层：百数板、加减法、图形与几何、常见的量、数独、数字描红',
      '通用交互层：题干播报、喇叭重播、拖拽定位、通用计时',
      '本地状态层：设置项和部分练习偏好的本地保存',
      '样式层：统一设计系统、模块页面样式和响应式布局支持',
    ]) + paragraphList([
      '软件整体采用纯前端实现方式，各页面之间通过静态文件和浏览器内置能力完成界面展示、交互处理和本地数据读写，无需复杂部署结构即可运行。',
    ]),
  },
  {
    title: '交互原则',
    subtitle: '第7章 设计原则',
    content: sectionList([
      '优先采用图标、颜色和位置提示，减少儿童阅读负担',
      '通过语音播报引导题干，帮助儿童理解任务要求',
      '错误反馈尽量温和，以鼓励和再次尝试为导向',
      '按钮尺寸、拖拽容差和控件布局适配儿童触控操作习惯',
      '作答后自动进入下一题，减少无效等待和额外点击',
    ]) + paragraphList([
      '以上设计原则贯穿软件各功能模块，是软件面向儿童用户进行界面设计和交互设计的核心依据。',
    ]),
  },
  {
    title: '首页界面',
    subtitle: '第8章 首页截图',
    content: screenshotBlock('软件首页截图', screenshots.index, '首页展示百数板、图形与几何、常见的量、加减法、数独、数字描红等主要模块入口。'),
  },
  {
    title: '首页说明',
    subtitle: '第9章 首页功能说明',
    content: paragraphList([
      '首页承担软件主导航功能，以卡片方式向用户展示各学习模块。用户点击模块卡片即可进入对应练习页面。',
      '首页顶部展示软件名称和年龄提示信息，同时提供设置按钮用于进入家长控制和参数配置页面。',
      '首页布局以大面积卡片、圆角、高对比色块为核心视觉特征，适配平板竖屏和浏览器窗口环境。',
    ]) + sectionList([
      '提供统一入口',
      '支持模块快速跳转',
      '支持设置页访问',
      '突出儿童化视觉风格',
    ]),
  },
  {
    title: '百数板概述',
    subtitle: '第10章 百数板模块',
    content: paragraphList([
      '百数板模块用于帮助儿童建立1至100数字序列认知，支持数字顺序、缺数填空、跳数和数位认识等多种练习模式。',
      '该模块通过网格化界面、点击反馈和拖拽作答提升数字学习过程中的可视化程度和互动性。',
    ]) + sectionList([
      '数字顺序识别',
      '空缺数字拖拽填充',
      '跳数高亮练习',
      '十位与个位认知',
    ]),
  },
  {
    title: '百数板功能',
    subtitle: '第11章 百数板业务规则',
    content: sectionList([
      '网格以10×10形式展示1至100数字',
      '点击数字可触发语音播报',
      '缺数填空模式随机生成空缺位置，并在底部显示待拖拽数字',
      '跳数模式支持按2、5、10等步长进行高亮',
      '数位认识模式可展示十位和个位拆分内容',
    ]) + paragraphList([
      '该模块重点针对儿童数字序列、数位概念和观察推理能力进行训练。',
    ]),
  },
  {
    title: '百数板截图',
    subtitle: '第12章 百数板界面',
    content: screenshotBlock('百数板页面截图', screenshots.baisu, '页面展示百数板练习区、模式切换区以及可交互的题目内容。'),
  },
  {
    title: '百数板技术实现',
    subtitle: '第13章 百数板实现说明',
    content: paragraphList([
      '百数板模块通过独立脚本组织状态、模式切换和拖拽作答流程，在浏览器环境下完成网格生成、题目生成和结果判定。',
      '针对平板设备中的拖拽偏移问题，模块结合视口偏移和渲染尺寸进行定位计算，使气泡或数字块与手指轨迹保持更高一致性。',
      '模块还集成了统一语音播报和反馈逻辑，用于提升儿童在自主练习时的任务理解能力。',
    ]),
  },
  {
    title: '加减法概述',
    subtitle: '第14章 加减法模块',
    content: paragraphList([
      '加减法模块用于训练儿童对10以内、20以内和100以内加减运算的理解与作答能力。',
      '软件通过直观的题目呈现和适龄化操作方式，让儿童在多轮短练习中完成基础运算训练。',
    ]) + sectionList([
      '支持不同难度等级',
      '支持题干语音播报',
      '支持答题后自动进入下一题',
      '支持错误后继续留在当前题目进行作答',
    ]),
  },
  {
    title: '加减法规则',
    subtitle: '第15章 加减法练习说明',
    content: sectionList([
      '按照数字范围组织不同练习层级',
      '题目和答案区域结构清晰，便于儿童观察',
      '通过按钮和视觉提示减少误操作',
      '答对时提供正向反馈，答错时保留重试机会',
    ]) + paragraphList([
      '该模块注重练习节奏和重复训练体验，使儿童能够在较低门槛下持续完成基础运算练习。',
    ]),
  },
  {
    title: '加减法截图',
    subtitle: '第16章 加减法界面',
    content: screenshotBlock('加减法页面截图', screenshots.math, '页面展示算式练习、答案操作按钮和儿童友好的视觉布局。'),
  },
  {
    title: '加减法技术实现',
    subtitle: '第17章 加减法实现说明',
    content: paragraphList([
      '加减法模块通过题目数据生成、难度配置和界面渲染逻辑完成练习流程控制。',
      '模块将题干播报、正确反馈和错误反馈纳入统一语音逻辑，并通过状态锁定机制避免重复点击带来的异常跳题问题。',
      '为保证儿童持续练习体验，模块在答案判定后自动安排下一题并减少等待时间。',
    ]),
  },
  {
    title: '图形与几何概述',
    subtitle: '第18章 图形模块',
    content: paragraphList([
      '图形与几何模块围绕基本图形认知、图形分类、空间位置和拼图练习展开，帮助儿童建立初步几何感知。',
      '模块使用颜色、形状和直观位置关系进行训练，适合儿童在较少文字阅读情况下完成认知和练习。',
    ]) + sectionList([
      '图形识别',
      '图形分类',
      '拼图与组合',
      '听指令定位',
    ]),
  },
  {
    title: '图形模块规则',
    subtitle: '第19章 图形练习说明',
    content: sectionList([
      '按任务要求完成图形选择或拖拽',
      '通过图形颜色和结构差异增强认知',
      '支持平板端拖拽交互',
      '提供轻反馈式提示与纠错机制',
    ]) + paragraphList([
      '图形模块兼顾识别训练和操作训练，适合儿童进行多轮短时练习。',
    ]),
  },
  {
    title: '图形与几何截图',
    subtitle: '第20章 图形模块界面',
    content: screenshotBlock('图形与几何页面截图', screenshots.shape, '页面展示图形学习任务、操作区和面向儿童的图形化交互布局。'),
  },
  {
    title: '图形技术实现',
    subtitle: '第21章 图形模块实现说明',
    content: paragraphList([
      '图形模块通过前端脚本组织题目、目标区域和交互反馈，实现图形识别、分类和拼图等练习模式。',
      '页面针对Safari和平板端渲染表现做了兼容性优化，以提升形状绘制和布局稳定性。',
      '模块复用了通用交互能力，保证音频提示、拖拽定位和练习节奏在不同页面中保持一致。',
    ]),
  },
  {
    title: '常见的量概述',
    subtitle: '第22章 常见的量模块',
    content: paragraphList([
      '常见的量模块覆盖钟表、比较、长度、重量、日历和人民币等启蒙学习主题，用于帮助儿童建立基础量感和生活数学认知。',
      '该模块强调生活化场景，将抽象概念转化为可视化、可操作的互动任务。',
    ]) + sectionList([
      '时间认知',
      '长度与重量比较',
      '日历认知',
      '人民币认知',
    ]),
  },
  {
    title: '常见的量规则',
    subtitle: '第23章 常见的量练习说明',
    content: sectionList([
      '通过钟表拖动和指针识别进行时间练习',
      '通过尺子和刻度界面进行长度认知',
      '通过天平和物品比较进行重量训练',
      '通过日期、金额和生活元素建立量感认知',
    ]) + paragraphList([
      '模块在题型设计上兼顾“看、选、拖、判定”多种交互方式，增强学习体验的多样性。',
    ]),
  },
  {
    title: '常见的量截图',
    subtitle: '第24章 常见的量界面',
    content: screenshotBlock('常见的量页面截图', screenshots.measure, '页面展示钟表、比较、长度、重量、人民币等练习入口与互动区域。'),
  },
  {
    title: '常见的量技术实现',
    subtitle: '第25章 常见的量实现说明',
    content: paragraphList([
      '该模块综合使用SVG/DOM绘制、拖拽交互和状态计算实现钟表、刻度、比较和金额等不同题型。',
      '模块支持鼠标与触摸双输入方式，并在时间、比较和计量练习中使用统一判定流程管理题目切换和反馈展示。',
      '页面对移动端触控交互进行了重点优化，以避免拖拽和点击在不同设备中的偏移和抖动问题。',
    ]),
  },
  {
    title: '数独概述',
    subtitle: '第26章 数独模块',
    content: paragraphList([
      '数独模块用于训练儿童的数字逻辑、观察能力和规则意识，当前包含4乘4、6乘6和9乘9等不同阶段。',
      '模块从入门到进阶逐步提高难度，使儿童在可控挑战中形成数独基本思维。',
    ]) + sectionList([
      '4乘4入门与进阶',
      '6乘6入门与进阶',
      '9乘9入门与进阶',
      '拖动填数与自动判定',
    ]),
  },
  {
    title: '数独规则',
    subtitle: '第27章 数独练习说明',
    content: sectionList([
      '通过底部数字拖拽至棋盘空白格完成作答',
      '固定数字和空白格采用不同样式区分',
      '答错不跳题，答对后自动进入下一题',
      '不同阶段使用不同棋盘规格和视觉比例',
    ]) + paragraphList([
      '数独模块在儿童逻辑练习场景中，兼顾规则理解、操作体验和阶段递进。',
    ]),
  },
  {
    title: '数独截图',
    subtitle: '第28章 数独界面',
    content: screenshotBlock('数独页面截图', screenshots.sudoku, '页面展示阶段切换、棋盘区域和底部可拖动数字按钮。'),
  },
  {
    title: '数独技术实现',
    subtitle: '第29章 数独实现说明',
    content: paragraphList([
      '数独模块基于题目结构、棋盘渲染和拖拽输入逻辑完成练习流程。不同难度下会动态计算棋盘布局和数字区比例，以保证盘面稳定性。',
      '模块在多次迭代中持续优化棋盘显示、边框样式、颜色层次和语音文案，使其更符合儿童学习和Pad端浏览体验。',
      '该模块体现了软件在逻辑训练类页面中的交互组织能力和样式兼容能力。',
    ]),
  },
  {
    title: '数字描红概述',
    subtitle: '第30章 数字描红模块',
    content: paragraphList([
      '数字描红模块用于帮助儿童练习数字书写和笔画轨迹控制，支持随机数字练习和描红判定。',
      '模块不依赖复杂输入法，而是通过画布绘制和手势轨迹识别实现数字描红体验。',
    ]) + sectionList([
      '支持1至100随机数字练习',
      '支持单个数字或多位数字按位展示',
      '支持描红轨迹判定和结果反馈',
      '支持顶部标题区和底部按钮区统一布局',
    ]),
  },
  {
    title: '描红规则',
    subtitle: '第31章 描红练习说明',
    content: sectionList([
      '采用数字骨架路径而非单纯字体描边',
      '支持画布层叠显示背景骨架与用户轨迹',
      '使用覆盖率和关键点命中进行判定',
      '通过适度放宽判定阈值提升儿童练习通过率',
    ]) + paragraphList([
      '描红模块将书写练习与儿童操作习惯结合，强调“主体覆盖到位、少量出界可接受”的策略，以提高学习正反馈。',
    ]),
  },
  {
    title: '数字描红截图',
    subtitle: '第32章 描红界面',
    content: screenshotBlock('数字描红页面截图', screenshots.trace, '页面展示数字练习区、描红画布和操作按钮。'),
  },
  {
    title: '描红技术实现',
    subtitle: '第33章 描红实现说明',
    content: paragraphList([
      '描红模块通过HTML5 Canvas构建背景层和绘制层，实现轨迹渲染、擦除控制和命中检测。',
      '系统采用数字骨架路径组合方式生成不同数字的练习轮廓，避免字体差异影响判定体验。',
      '模块还通过按位判定、多位数分栏和关键点命中机制提高识别准确度，增强幼小衔接书写体验。',
    ]),
  },
  {
    title: '设置功能',
    subtitle: '第34章 设置与家长控制',
    content: paragraphList([
      '设置页用于管理部分家长控制和软件参数配置，帮助在儿童使用场景下进行简单限制与辅助。',
      '设置内容通过浏览器本地存储保留部分状态，使软件在再次打开时可以延续用户设置。',
    ]) + sectionList([
      '进入设置页前可进行家长验证',
      '支持本地保存设置项',
      '与主练习流程分离，避免儿童误触',
      '为软件后续扩展保留统一配置入口',
    ]),
  },
  {
    title: '设置截图',
    subtitle: '第35章 设置页界面',
    content: screenshotBlock('设置页面截图', screenshots.settings, '页面展示家长验证与设置入口相关界面内容。'),
  },
  {
    title: '语音播报',
    subtitle: '第36章 通用语音能力',
    content: paragraphList([
      '软件多个练习模块均支持题干自动播报和喇叭按钮重播功能，以适应低龄儿童对语音引导的需求。',
      '语音能力建立在浏览器语音播报接口之上，可在进入题目时自动播放关键提示，并在用户主动点击时再次播放。',
      '统一语音控制逻辑有助于减少重复实现，提高跨页面交互一致性。',
    ]),
  },
  {
    title: '拖拽定位',
    subtitle: '第37章 通用拖拽能力',
    content: paragraphList([
      '软件中的百数板、图形模块、数独模块等均存在拖拽作答场景，因此实现了通用拖拽定位处理逻辑。',
      '拖拽定位会综合元素渲染尺寸、浏览器视口偏移以及鼠标/触摸坐标进行计算，以降低移动端偏移问题。',
      '该能力是软件适配平板端操作体验的关键技术基础之一。',
    ]) + sectionList([
      '支持触摸与鼠标双输入',
      '支持拖动开始、移动、结束的状态控制',
      '支持错误回弹与正确吸附',
      '支持Pad端定位偏移修正',
    ]),
  },
  {
    title: '触控适配',
    subtitle: '第38章 儿童触控优化',
    content: sectionList([
      '按钮与卡片尺寸偏大，适合儿童手指点击',
      '拖拽判定容差放宽，以减少低龄用户误差',
      '页面布局对竖屏和平板操作进行适配',
      '交互反馈以视觉变化和语音提示为主',
    ]) + paragraphList([
      '软件将“能否让儿童顺畅完成一次练习”作为核心适配目标，而不是单纯追求复杂动画或成人式信息密度。',
    ]),
  },
  {
    title: '本地存储',
    subtitle: '第39章 数据保存方式',
    content: paragraphList([
      '软件采用浏览器本地存储保存部分设置和偏好项，不依赖外部数据库即可完成基础状态延续。',
      '这种设计方式简化了部署结构，适合家庭、平板和离线环境中的轻量使用场景。',
      '本地存储能力也为后续增加更多个人化配置、练习偏好记忆和家长控制参数提供了扩展基础。',
    ]),
  },
  {
    title: '页面组织',
    subtitle: '第40章 页面结构说明',
    content: sectionList([
      'index.html：软件首页入口',
      'baisu.html：百数板模块',
      'math.html：加减法模块',
      'shape.html：图形与几何模块',
      'measure.html：常见的量模块',
      'sudoku.html：数独模块',
      'trace.html：数字描红模块',
      'settings.html：设置页',
    ]) + paragraphList([
      '各模块页面结构清晰，便于独立维护、独立调试和后续扩展。',
    ]),
  },
  {
    title: '代码组织',
    subtitle: '第41章 源码结构说明',
    content: twoCol(
      '脚本层',
      sectionList([
        'baisu-board.js',
        'math.js',
        'measure.js',
        'shape.js',
        'sudoku.js',
        'trace.js',
        'practice-support.js',
        'timer.js',
      ]),
      '样式层',
      sectionList([
        'design-system.css',
        'baisu-board.css',
        'math.css',
        'measure.css',
        'shape.css',
        'sudoku.css',
        'trace.css',
      ]),
    ),
  },
  {
    title: '关键算法一',
    subtitle: '第42章 题目与状态控制',
    content: paragraphList([
      '软件通过题目生成、状态切换和结果反馈机制组织练习流程。每个模块根据自身题型生成问题数据，再结合统一显示逻辑输出到页面。',
      '在作答判定通过后，系统会通过状态锁定和延迟调度机制进入下一题，减少快速点击造成的重复跳题和界面异常。',
      '这种控制方式适合儿童练习场景，能够在维持节奏的同时降低误操作风险。',
    ]),
  },
  {
    title: '关键算法二',
    subtitle: '第43章 判定与反馈机制',
    content: paragraphList([
      '不同模块根据题型特点采用不同判定方式，例如数字匹配、位置匹配、图形匹配、轨迹覆盖率判定和数独规则校验等。',
      '判定结果通过颜色变化、元素吸附、界面提示和语音播报等方式反馈给用户，使儿童能快速理解当前结果。',
      '系统在错误反馈上保持正向和温和，避免使用过于强烈的惩罚式表现。',
    ]),
  },
  {
    title: '异常处理',
    subtitle: '第44章 稳定性设计',
    content: sectionList([
      '在语音接口不可用时保持练习流程可继续进行',
      '在拖拽坐标异常时通过视口修正降低偏移影响',
      '在连续点击场景下通过锁定题目防止重复切换',
      '在不同浏览器渲染差异下对样式和布局进行兼容调整',
    ]) + paragraphList([
      '上述稳定性设计使软件更适合在真实儿童使用场景中运行。',
    ]),
  },
  {
    title: '兼容性说明',
    subtitle: '第45章 平台兼容性',
    content: sectionList([
      '支持Windows浏览器运行',
      '支持Android平板浏览器运行',
      '支持iPadOS / iOS浏览器运行',
      '兼容Chrome、Edge、Safari等现代浏览器',
    ]) + paragraphList([
      '软件主体为标准前端实现，部署简单，兼容性范围较广，适合轻量分发与在线展示。',
    ]),
  },
  {
    title: '测试方案',
    subtitle: '第46章 质量验证',
    content: paragraphList([
      '软件在开发过程中对核心通用能力和重点模块进行了回归测试，用于验证题干播报、拖拽定位、描红判定、数独逻辑等关键功能。',
      '此外，还通过页面运行检查和手工浏览测试验证首页、模块跳转和交互流程是否正常。',
      '测试目标是确保软件在常见浏览器和平板场景中能够稳定完成一轮完整练习。',
    ]),
  },
  {
    title: '测试覆盖',
    subtitle: '第47章 主要测试点',
    content: sectionList([
      'practice-support：题干播报、重播与拖拽定位',
      'measure：常见的量相关判定逻辑',
      'shape：图形模块交互逻辑',
      'sudoku：数独题目与填数逻辑',
      'trace：数字描红随机数范围和轨迹判定逻辑',
    ]) + paragraphList([
      '通过自动化测试与手工测试结合的方式，提高了模块核心逻辑的可靠性。',
    ]),
  },
  {
    title: '隐私与安全',
    subtitle: '第48章 数据与权限',
    content: paragraphList([
      '软件为纯前端浏览器应用，主体功能不依赖复杂用户账号体系和远程数据库，因此不涉及大规模个人信息采集。',
      '当前版本主要在浏览器本地存储部分设置项，用于提升使用连续性和家长控制便利性。',
      '这种设计有利于控制数据复杂度，降低部署和维护成本。',
    ]),
  },
  {
    title: '发布方式',
    subtitle: '第49章 部署与交付',
    content: sectionList([
      '可作为静态网页文件直接运行',
      '可发布至GitHub Pages等静态托管平台',
      '可在本地浏览器或平板浏览器中直接打开',
      '无需复杂服务端部署即可完成体验和交付',
    ]) + paragraphList([
      '静态部署方式降低了软件试用和推广门槛，适合教育产品早期验证与演示。',
    ]),
  },
  {
    title: '使用流程',
    subtitle: '第50章 用户操作流程',
    content: sectionList([
      '打开软件首页',
      '选择目标练习模块',
      '根据页面提示完成拖拽、点击或描红操作',
      '获得即时反馈并继续下一题',
      '如需调整设置可进入设置页进行家长控制',
    ]) + paragraphList([
      '整体流程短、反馈快、操作直观，符合儿童启蒙训练中“短频快”的使用节奏。',
    ]),
  },
  {
    title: '模块操作说明',
    subtitle: '第51章 主要操作方式',
    content: twoCol(
      '常用操作',
      sectionList([
        '点击模块卡片进入页面',
        '点击喇叭重播题干',
        '拖拽数字或图形完成作答',
        '在描红页通过手指或鼠标进行书写',
      ]),
      '反馈方式',
      sectionList([
        '颜色变化',
        '元素吸附或回弹',
        '正向语音提示',
        '自动进入下一题',
      ]),
    ),
  },
  {
    title: '截图总览',
    subtitle: '第52章 主要界面总览',
    content: `
      <div class="gallery-grid">
        ${screenshotBlock('首页', screenshots.index, '模块入口').replace('screenshot-card', 'screenshot-card small')}
        ${screenshotBlock('百数板', screenshots.baisu, '数字认知').replace('screenshot-card', 'screenshot-card small')}
        ${screenshotBlock('加减法', screenshots.math, '基础运算').replace('screenshot-card', 'screenshot-card small')}
        ${screenshotBlock('图形与几何', screenshots.shape, '图形认知').replace('screenshot-card', 'screenshot-card small')}
      </div>`,
  },
  {
    title: '截图总览',
    subtitle: '第53章 主要界面总览（续）',
    content: `
      <div class="gallery-grid">
        ${screenshotBlock('常见的量', screenshots.measure, '生活数学').replace('screenshot-card', 'screenshot-card small')}
        ${screenshotBlock('数独', screenshots.sudoku, '逻辑训练').replace('screenshot-card', 'screenshot-card small')}
        ${screenshotBlock('数字描红', screenshots.trace, '数字书写').replace('screenshot-card', 'screenshot-card small')}
        ${screenshotBlock('设置页', screenshots.settings, '家长控制').replace('screenshot-card', 'screenshot-card small')}
      </div>`,
  },
  {
    title: '百数板图集',
    subtitle: '第54章 百数板多模式截图',
    content: gallery([
      screenshotBlock('认数字', detailed.baisuOrder, '数字识别练习界面').replace('screenshot-card', 'screenshot-card small'),
      screenshotBlock('找邻居', detailed.baisuNeighbor, '局部连续数字推理').replace('screenshot-card', 'screenshot-card small'),
      screenshotBlock('九宫格', detailed.baisuNinegrid, '数字位置关系训练').replace('screenshot-card', 'screenshot-card small'),
      screenshotBlock('找规律', detailed.baisuPattern, '步长与模式观察').replace('screenshot-card', 'screenshot-card small'),
    ]),
  },
  {
    title: '百数板图集',
    subtitle: '第55章 百数板补充截图',
    content: gallery([
      screenshotBlock('数字寻宝', detailed.baisuTreasure, '目标数字搜索练习').replace('screenshot-card', 'screenshot-card small'),
      screenshotBlock('首页入口', detailed.indexDefault, '百数板模块在软件首页中的入口').replace('screenshot-card', 'screenshot-card small'),
    ]),
  },
  {
    title: '常见的量图集',
    subtitle: '第56章 常见的量多模式截图',
    content: gallery([
      screenshotBlock('钟表', detailed.measureClock, '时间认知练习').replace('screenshot-card', 'screenshot-card small'),
      screenshotBlock('人民币', detailed.measureMoney, '商品与支付练习').replace('screenshot-card', 'screenshot-card small'),
      screenshotBlock('比较', detailed.measureCompare, '大小长短等比较练习').replace('screenshot-card', 'screenshot-card small'),
      screenshotBlock('测量', detailed.measureLength, '刻度与长度练习').replace('screenshot-card', 'screenshot-card small'),
    ]),
  },
  {
    title: '常见的量图集',
    subtitle: '第57章 常见的量补充截图',
    content: gallery([
      screenshotBlock('轻重', detailed.measureWeight, '天平与重量判断').replace('screenshot-card', 'screenshot-card small'),
      screenshotBlock('日历', detailed.measureCalendar, '日期和日历认知').replace('screenshot-card', 'screenshot-card small'),
    ]),
  },
  {
    title: '图形与几何图集',
    subtitle: '第58章 图形模块多模式截图',
    content: gallery([
      screenshotBlock('辨认', detailed.shapeRecognize, '基本图形认知').replace('screenshot-card', 'screenshot-card small'),
      screenshotBlock('分类', detailed.shapeClassify, '图形分类练习').replace('screenshot-card', 'screenshot-card small'),
      screenshotBlock('找一找', detailed.shapeFind, '场景找图训练').replace('screenshot-card', 'screenshot-card small'),
      screenshotBlock('拼一拼', detailed.shapeTangram, '七巧板拼摆练习').replace('screenshot-card', 'screenshot-card small'),
    ]),
  },
  {
    title: '图形与几何图集',
    subtitle: '第59章 图形模块补充截图',
    content: gallery([
      screenshotBlock('听指令', detailed.shapeSpatial, '方位九宫格练习').replace('screenshot-card', 'screenshot-card small'),
    ]),
  },
  {
    title: '加减法图集',
    subtitle: '第60章 加减法不同等级截图',
    content: gallery([
      screenshotBlock('10以内', detailed.mathLevel1, '入门级加减练习').replace('screenshot-card', 'screenshot-card small'),
      screenshotBlock('20以内', detailed.mathLevel2, '进位加减练习').replace('screenshot-card', 'screenshot-card small'),
      screenshotBlock('100以内', detailed.mathLevel3, '更高范围运算练习').replace('screenshot-card', 'screenshot-card small'),
    ]),
  },
  {
    title: '数独图集',
    subtitle: '第61章 数独阶段截图一',
    content: gallery([
      screenshotBlock('4x4入门', detailed.sudoku4Easy, '基础数独练习').replace('screenshot-card', 'screenshot-card small'),
      screenshotBlock('4x4进阶', detailed.sudoku4Advanced, '4x4进阶练习').replace('screenshot-card', 'screenshot-card small'),
      screenshotBlock('6x6入门', detailed.sudoku6Easy, '6x6基础练习').replace('screenshot-card', 'screenshot-card small'),
      screenshotBlock('6x6进阶', detailed.sudoku6Advanced, '6x6进阶练习').replace('screenshot-card', 'screenshot-card small'),
    ]),
  },
  {
    title: '数独图集',
    subtitle: '第62章 数独阶段截图二',
    content: gallery([
      screenshotBlock('9x9入门', detailed.sudoku9Easy, '9x9基础练习').replace('screenshot-card', 'screenshot-card small'),
      screenshotBlock('9x9进阶', detailed.sudoku9Advanced, '9x9进阶练习').replace('screenshot-card', 'screenshot-card small'),
    ]),
  },
  {
    title: '补充截图',
    subtitle: '第63章 描红与设置截图',
    content: gallery([
      screenshotBlock('数字描红', detailed.traceDefault, '数字描红书写界面').replace('screenshot-card', 'screenshot-card small'),
      screenshotBlock('设置页', detailed.settingsDefault, '家长设置与控制界面').replace('screenshot-card', 'screenshot-card small'),
    ]),
  },
  {
    title: '技术优势',
    subtitle: '第64章 软件技术特点',
    content: sectionList([
      '纯前端实现，部署和运行成本较低',
      '支持浏览器跨平台运行，适合平板与桌面环境',
      '多模块统一交互能力，提高维护效率',
      '强调儿童适龄交互设计，触控体验友好',
      '使用画布、拖拽、语音播报和本地存储等前端能力提升体验',
    ]),
  },
  {
    title: '创新点说明',
    subtitle: '第65章 功能亮点',
    content: paragraphList([
      '软件将数字启蒙、图形认知、量感训练、逻辑训练和数字描红等多个场景整合到同一套儿童化交互体系中，形成统一的启蒙学习入口。',
      '针对低龄儿童常见的阅读弱、手指控制误差大、注意力持续时间短等问题，软件通过语音引导、拖拽容错、自动下一题和温和反馈进行针对性设计。',
      '在纯前端实现前提下，软件仍兼顾多模块交互组织、画布描红、逻辑棋盘和多题型页面，具备较好的综合实现能力。',
    ]),
  },
  {
    title: '版本信息',
    subtitle: '第66章 版本与规模',
    content: sectionList([
      `软件全称：${softwareName}`,
      `软件简称：${shortName}`,
      `版本号：${version}`,
      '软件分类：应用软件',
      '面向领域：教育行业 / 儿童启蒙教育',
      '源程序量：约10021行（主程序源码）',
    ]),
  },
  {
    title: '应用价值',
    subtitle: '第67章 使用价值',
    content: paragraphList([
      '软件可以作为儿童数学启蒙训练工具，为家庭和教育辅助场景提供轻量化、可视化、可互动的数学学习方式。',
      '软件通过统一模块入口和多样练习模式，使儿童在一个系统内完成不同维度的数学启蒙任务，提升学习效率和使用连续性。',
      '对于产品试点、课程辅助和家庭训练而言，该软件具备易部署、易使用和可持续扩展等优势。',
    ]),
  },
  {
    title: '结论',
    subtitle: '第68章 总结',
    content: paragraphList([
      `${softwareName}围绕儿童数学启蒙场景构建了较完整的软件功能体系，具备明确的使用对象、清晰的模块结构和稳定的浏览器运行能力。`,
      '软件在交互设计上强调儿童适龄体验，在技术实现上采用标准前端技术组合，并通过统一交互能力支撑多个不同学习模块。',
      '综合来看，本软件具备独立的软件结构、明确的应用价值和较好的技术完成度，适合作为计算机软件著作权登记的申请对象。',
    ]),
  },
  {
    title: '声明页',
    subtitle: '第69章 材料说明',
    content: sectionList([
      '本说明书用于软件著作权登记文档鉴别材料提交',
      '文中截图为软件实际运行界面截图',
      '文中环境、功能和技术说明与申报版本一致',
      '软件全称、版本号与申请表保持一致',
    ]) + paragraphList([
      `软件名称统一为“${softwareName}”，版本统一为“${version}”。`,
    ]),
  },
  {
    title: '结束页',
    subtitle: '第70章 封底',
    content: `
      <div class="ending">
        <div class="ending-title">${softwareName}</div>
        <div class="ending-subtitle">软件说明书（文档鉴别材料）</div>
        <div class="ending-note">完</div>
      </div>`,
  },
];

if (pages.length < 60) {
  throw new Error(`Expected at least 60 pages, received ${pages.length}`);
}

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>${softwareName} 文档鉴别材料</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm 14mm 16mm;
    }
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      color: #1f2937;
      font-family: "Microsoft YaHei", "PingFang SC", "Noto Sans SC", sans-serif;
      background: #ffffff;
    }
    .page {
      page-break-after: always;
      min-height: 267mm;
      display: flex;
      flex-direction: column;
      padding: 0;
    }
    .page:last-child {
      page-break-after: auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-bottom: 6px;
      border-bottom: 2px solid #dbeafe;
      margin-bottom: 10px;
    }
    .header h1 {
      margin: 0;
      font-size: 18px;
      color: #1d4ed8;
    }
    .header .sub {
      font-size: 11px;
      color: #6b7280;
    }
    .body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 10px;
      font-size: 13px;
      line-height: 1.7;
    }
    .footer {
      border-top: 1px solid #e5e7eb;
      padding-top: 6px;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #6b7280;
      margin-top: 8px;
    }
    p {
      margin: 0;
      text-align: justify;
    }
    ul {
      margin: 0;
      padding-left: 18px;
    }
    li {
      margin: 4px 0;
    }
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .card {
      border: 1px solid #dbeafe;
      border-radius: 8px;
      padding: 10px 12px;
      background: #f8fbff;
    }
    .card h3 {
      margin: 0 0 8px;
      font-size: 14px;
      color: #1e3a8a;
    }
    .cover {
      min-height: 220mm;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 18px;
      text-align: center;
      background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
      border: 1px solid #dbeafe;
      border-radius: 14px;
      padding: 24px;
    }
    .cover-kicker {
      font-size: 14px;
      color: #1d4ed8;
      letter-spacing: 1px;
    }
    .cover h1 {
      margin: 0;
      font-size: 28px;
      color: #0f172a;
    }
    .cover-version {
      font-size: 18px;
      color: #334155;
    }
    .cover-meta {
      display: grid;
      gap: 6px;
      font-size: 14px;
      color: #475569;
    }
    .screenshot-card {
      border: 1px solid #d1d5db;
      border-radius: 10px;
      padding: 10px;
      background: #ffffff;
    }
    .screenshot-card.small {
      padding: 8px;
    }
    .screenshot-title {
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 8px;
      color: #1e3a8a;
    }
    .screenshot-card img {
      width: 100%;
      max-height: 190mm;
      object-fit: contain;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: #fff;
    }
    .screenshot-card.small img {
      max-height: 90mm;
    }
    .screenshot-caption {
      font-size: 11px;
      color: #6b7280;
      margin-top: 6px;
    }
    .gallery-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .ending {
      min-height: 220mm;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      gap: 14px;
    }
    .ending-title {
      font-size: 26px;
      font-weight: 700;
      color: #0f172a;
    }
    .ending-subtitle {
      font-size: 16px;
      color: #475569;
    }
    .ending-note {
      font-size: 22px;
      color: #1d4ed8;
      letter-spacing: 6px;
    }
  </style>
</head>
<body>
  ${pages.map((page, index) => `
    <section class="page">
      <div class="header">
        <div>
          <h1>${page.title}</h1>
          <div class="sub">${page.subtitle}</div>
        </div>
        <div class="sub">${softwareName} ${version}</div>
      </div>
      <div class="body">${page.content}</div>
      <div class="footer">
        <span>软件全称：${softwareName}</span>
        <span>第 ${index + 1} 页 / 共 ${pages.length} 页</span>
      </div>
    </section>`).join('')}
</body>
</html>`;

fs.writeFileSync(outputHtml, html, 'utf8');
fs.writeFileSync(outputMeta, JSON.stringify({
  softwareName,
  shortName,
  version,
  totalPages: pages.length,
  screenshots: Object.keys(screenshots),
  outputHtml: path.basename(outputHtml),
}, null, 2), 'utf8');

console.log(JSON.stringify({
  html: outputHtml,
  meta: outputMeta,
  pages: pages.length,
}, null, 2));

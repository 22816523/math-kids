$ErrorActionPreference = "Stop"

$templatePath = "D:\文档\JTY\AI项目文档\3-纸张管理扫码出入库\ppt-sample\PPT模板.pptx"
$outputPath = "D:\文档\JTY\AI项目文档\3-纸张管理扫码出入库\ppt-sample\AI参与原有功能迭代升级的产品设计经验_套模板版.pptx"

function Clear-TextShapes {
    param($slide)
    for ($i = 1; $i -le $slide.Shapes.Count; $i++) {
        $shape = $slide.Shapes.Item($i)
        if ($shape.HasTextFrame -and $shape.TextFrame.HasText) {
            $shape.TextFrame.TextRange.Text = ""
        }
    }
}

function Set-Text {
    param($slide, [int]$shapeIndex, [string]$value)
    $slide.Shapes.Item($shapeIndex).TextFrame.TextRange.Text = $value
}

$pp = New-Object -ComObject PowerPoint.Application
$source = $pp.Presentations.Open($templatePath, $false, $true, $false)
$target = $pp.Presentations.Add()

while ($target.Slides.Count -gt 0) {
    $target.Slides.Item(1).Delete()
}

$selectedSlides = @(1, 2, 5, 6, 17, 4, 10, 13, 18, 19, 20)
foreach ($slideNo in $selectedSlides) {
    $source.Slides.Item($slideNo).Copy()
    $null = $target.Slides.Paste()
}

# Slide 1 cover
$slide = $target.Slides.Item(1)
Set-Text $slide 5 "AI参与原有功能迭代升级`n产品设计经验分享"
Set-Text $slide 7 "AI-ENABLED PRODUCT ITERATION"
Set-Text $slide 10 "Paper management scan in/out inventory project case"

# Slide 2 contents
$slide = $target.Slides.Item(2)
Set-Text $slide 1 "CONTENTS"
Set-Text $slide 2 "目录-CONTENTS"
Set-Text $slide 6 "为什么讲这个项目"
Set-Text $slide 7 "Why This Project"
Set-Text $slide 9 "01"
Set-Text $slide 16 "AI是怎么介入的，价值体现在哪"
Set-Text $slide 17 "How AI Added Value"
Set-Text $slide 19 "02"
Set-Text $slide 11 "踩坑案例与成功案例"
Set-Text $slide 12 "Pitfalls And Effective Practices"
Set-Text $slide 14 "03"
Set-Text $slide 21 "协作指令模式与最终结论"
Set-Text $slide 22 "Prompting Patterns And Final Takeaways"
Set-Text $slide 24 "04"
Set-Text $slide 26 "AI product design experience sharing"

# Slide 3 chapter page
$slide = $target.Slides.Item(3)
Set-Text $slide 1 "为什么讲这个项目"
Set-Text $slide 2 "Why This Project"

# Slide 4 why this project detail
$slide = $target.Slides.Item(4)
Set-Text $slide 1 "为什么选这个项目"
Set-Text $slide 2 "Why This Case"
Set-Text $slide 3 "这不是一次“AI帮我把文档写快了”的分享，而是一次围绕原有 ERP 纸张管理功能做迭代升级时，我如何把 AI 作为产品设计协作工具来使用、踩了哪些坑、又是怎么一步步把它调教到能真正帮上忙的过程复盘。"
Set-Text $slide 4 "项目背景"
Set-Text $slide 5 "价值"

# Slide 5 pain points
$slide = $target.Slides.Item(5)
Set-Text $slide 1 "没有AI时，产品经理卡在哪里"
Set-Text $slide 2 "Pain Points Without AI"
Set-Text $slide 4 "需求零散"
Set-Text $slide 5 "原始需求跨多轮对话分散，前后补充多，容易漏。"
Set-Text $slide 6 "01"
Set-Text $slide 9 "材料打架"
Set-Text $slide 10 "原始需求、代码、PRD 经常不在一个口径上。"
Set-Text $slide 8 "02"
Set-Text $slide 13 "联动很碎"
Set-Text $slide 14 "原型、文档、规则要同步回写，机械活很多。"
Set-Text $slide 12 "03"

# Slide 6 AI value / intervention
$slide = $target.Slides.Item(6)
Set-Text $slide 1 "AI是怎么介入的，价值体现在哪"
Set-Text $slide 2 "How AI Added Value"
Set-Text $slide 9 "需求整理更快"
Set-Text $slide 10 "NO.1"
Set-Text $slide 11 "三方对照更快"
Set-Text $slide 12 "联动同步更快"
Set-Text $slide 13 "问题暴露更早"
Set-Text $slide 14 "保留判断给PM"
Set-Text $slide 21 "NO.2"
Set-Text $slide 22 "NO.3"
Set-Text $slide 23 "NO.4"
Set-Text $slide 24 "NO.5"
Set-Text $slide 25 "五个价值点"

# Slide 7 pitfalls
$slide = $target.Slides.Item(7)
Set-Text $slide 1 "踩坑案例：AI为什么会失控"
Set-Text $slide 2 "Why AI Went Off Track"
Set-Text $slide 11 "套旧经验"
Set-Text $slide 12 "看到相似能力，就默认应该复用。"
Set-Text $slide 13 "自动扩范围"
Set-Text $slide 14 "把实施项、导入、对接都产品化。"
Set-Text $slide 15 "理想化重设计"
Set-Text $slide 16 "更愿意给新方案，而不是贴着现有系统轻改。"
Set-Text $slide 17 "局部对，全局乱"
Set-Text $slide 18 "能完成当前指令，但不会天然维护整份文档一致性。"
Set-Text $slide 8 "01"
Set-Text $slide 19 "02"
Set-Text $slide 9 "03"
Set-Text $slide 10 "04"

# Slide 8 effective practices
$slide = $target.Slides.Item(8)
Set-Text $slide 1 "成功案例：怎样用AI才真正有效"
Set-Text $slide 2 "What Actually Worked"
Set-Text $slide 7 "先记录，不分析"
Set-Text $slide 8 "先把 AI 锁成记录员，避免过早脑补方案。"
Set-Text $slide 10 "先三方对照"
Set-Text $slide 11 "原始需求、代码、PRD 一起核，先暴露差异。"
Set-Text $slide 13 "先讲改法，再动文档"
Set-Text $slide 14 "先对齐修改策略，再落正式文档。"
Set-Text $slide 16 "范围压小，再让AI展开"
Set-Text $slide 17 "边界越清楚，AI 越稳定。"

# Slide 9 prompting patterns
$slide = $target.Slides.Item(9)
Set-Text $slide 1 "协作指令模式"
Set-Text $slide 2 "Prompting Patterns"
Set-Text $slide 17 "实际有效"
Set-Text $slide 18 "在我没有结束之前，你不用做任何分析，只接收和记录。"
Set-Text $slide 19 "实际有效"
Set-Text $slide 20 "结合代码和原始需求，对照 PRD 找问题。"
Set-Text $slide 21 "容易带偏"
Set-Text $slide 22 "你思考下有什么改进方案。"

# Slide 10 final takeaways
$slide = $target.Slides.Item(10)
Set-Text $slide 1 "最后想传递的结论"
Set-Text $slide 2 "Final Takeaways"
Set-Text $slide 6 "AI 的价值"
Set-Text $slide 5 "不在于替产品经理做产品，而在于帮你更快地整理、比对、同步和暴露问题。"
Set-Text $slide 12 "提效成立"
Set-Text $slide 11 "AI 的提效是成立的，但这个提效有边界。"
Set-Text $slide 14 "最优模式"
Set-Text $slide 13 "人拍板，AI 做大部分高耗时协作。"
Set-Text $slide 16 "真正关键"
Set-Text $slide 15 "边界判断、规则拍板、风险识别和最终取舍仍然要由产品经理掌握。"
Set-Text $slide 19 "最终沉淀"
Set-Text $slide 18 "最值得沉淀的，不是一组提示词，而是一套适用于存量功能迭代的 AI 协作方法。"

# Slide 11 ending
$slide = $target.Slides.Item(11)
Set-Text $slide 5 "谢谢观看`nTHANK YOU."
Set-Text $slide 7 "AI-ENABLED PRODUCT ITERATION"
Set-Text $slide 10 "在原有功能迭代项目里，AI 不是替代产品经理的设计者，而是放大产品经理能力的协作工具。"

$target.SaveAs($outputPath)
$target.Close()
$source.Close()
$pp.Quit()

Write-Output $outputPath

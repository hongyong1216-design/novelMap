// AI 生图默认提示词 —— 改写自 FrameRonin MapStitch 的内置提示词,
// 从像素风游戏地图适配为手绘幻想小说地图 (保留其核心: 补全透明区 / 锁定边缘 / 地形过渡)
export const DEFAULT_PROMPT = `你是一位专精俯视角幻想世界地图的专业画师。上传的参考图中只有边缘区域已有内容，中间透明区域是待补全的部分。请补全透明区域，使新内容与已有边缘无缝衔接，笔触、配色、光照与细节密度和参考图完全统一。整体为正俯视视角、无透视畸变，高分辨率、清晰质感、细节丰富。不同地形之间要自然过渡。不要出现人物、建筑、文字标注、图例或边框装饰。保持参考图中已有的边缘内容完全不变，不要平移、补充部分不要出现在参考图中、裁切或重新构图。`

// 补充提示词拼接进主提示词的方式 (同 FrameRonin: 主提示词 + 本格追加要求)
export const composePrompt = (basePrompt, extraPrompt) => {
  const base = basePrompt.trim() || DEFAULT_PROMPT
  const extra = extraPrompt.trim()
  return extra ? `${base}\n\n补充要求：${extra}` : base
}

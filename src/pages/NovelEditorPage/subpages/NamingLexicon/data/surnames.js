// 中式命名的姓氏库：常用单姓 + 玄幻常用复姓
// 姓不参与释义（姓本身无实义），只拼在名字最前面；复姓单列一组，取名时可专门挑

const s = (char, pinyin) => ({ char, pinyin, compound: char.length > 1 })

// 按人口常见度大致排序，前面的更「日常」，后面的更有辨识度
export const SINGLE_SURNAMES = [
  s('李', 'lǐ'), s('王', 'wáng'), s('张', 'zhāng'), s('刘', 'liú'), s('陈', 'chén'),
  s('杨', 'yáng'), s('赵', 'zhào'), s('黄', 'huáng'), s('周', 'zhōu'), s('吴', 'wú'),
  s('徐', 'xú'), s('孙', 'sūn'), s('胡', 'hú'), s('朱', 'zhū'), s('高', 'gāo'),
  s('林', 'lín'), s('何', 'hé'), s('郭', 'guō'), s('马', 'mǎ'), s('罗', 'luó'),
  s('梁', 'liáng'), s('宋', 'sòng'), s('郑', 'zhèng'), s('谢', 'xiè'), s('韩', 'hán'),
  s('唐', 'táng'), s('冯', 'féng'), s('于', 'yú'), s('董', 'dǒng'), s('萧', 'xiāo'),
  s('程', 'chéng'), s('曹', 'cáo'), s('袁', 'yuán'), s('邓', 'dèng'), s('许', 'xǔ'),
  s('傅', 'fù'), s('沈', 'shěn'), s('曾', 'zēng'), s('彭', 'péng'), s('吕', 'lǚ'),
  s('苏', 'sū'), s('卢', 'lú'), s('蒋', 'jiǎng'), s('蔡', 'cài'), s('贾', 'jiǎ'),
  s('丁', 'dīng'), s('魏', 'wèi'), s('薛', 'xuē'), s('叶', 'yè'), s('阎', 'yán'),
  s('余', 'yú'), s('潘', 'pān'), s('杜', 'dù'), s('戴', 'dài'), s('夏', 'xià'),
  s('钟', 'zhōng'), s('汪', 'wāng'), s('田', 'tián'), s('任', 'rén'), s('姜', 'jiāng'),
  s('范', 'fàn'), s('方', 'fāng'), s('石', 'shí'), s('姚', 'yáo'), s('谭', 'tán'),
  s('廖', 'liào'), s('邹', 'zōu'), s('熊', 'xióng'), s('金', 'jīn'), s('陆', 'lù'),
  s('郝', 'hǎo'), s('孔', 'kǒng'), s('白', 'bái'), s('崔', 'cuī'), s('康', 'kāng'),
  s('毛', 'máo'), s('邱', 'qiū'), s('秦', 'qín'), s('江', 'jiāng'), s('史', 'shǐ'),
  s('顾', 'gù'), s('侯', 'hóu'), s('邵', 'shào'), s('孟', 'mèng'), s('龙', 'lóng'),
  s('万', 'wàn'), s('段', 'duàn'), s('雷', 'léi'), s('钱', 'qián'), s('汤', 'tāng'),
  s('尹', 'yǐn'), s('黎', 'lí'), s('易', 'yì'), s('常', 'cháng'), s('武', 'wǔ'),
  s('乔', 'qiáo'), s('贺', 'hè'), s('赖', 'lài'), s('龚', 'gōng'), s('文', 'wén'),
  s('庞', 'páng'), s('樊', 'fán'), s('兰', 'lán'), s('殷', 'yīn'), s('施', 'shī'),
  s('陶', 'táo'), s('洪', 'hóng'), s('翟', 'zhái'), s('安', 'ān'), s('颜', 'yán'),
  s('倪', 'ní'), s('严', 'yán'), s('牛', 'niú'), s('温', 'wēn'), s('季', 'jì'),
  s('俞', 'yú'), s('章', 'zhāng'), s('鲁', 'lǔ'), s('葛', 'gě'), s('伍', 'wǔ'),
  s('韦', 'wéi'), s('申', 'shēn'), s('尤', 'yóu'), s('毕', 'bì'), s('聂', 'niè'),
  s('焦', 'jiāo'), s('向', 'xiàng'), s('柳', 'liǔ'), s('邢', 'xíng'), s('岳', 'yuè'),
  s('齐', 'qí'), s('沃', 'wò'), s('穆', 'mù'), s('华', 'huà'), s('宁', 'nìng'),
  s('慕', 'mù'), s('凌', 'líng'), s('霍', 'huò'), s('虞', 'yú'), s('祁', 'qí'),
  s('宗', 'zōng'), s('屈', 'qū'), s('闵', 'mǐn'), s('乐', 'yuè'), s('阮', 'ruǎn'),
]

// 复姓：玄幻 / 仙侠里最常用的一批，够撑起世家门阀的气派
export const COMPOUND_SURNAMES = [
  s('欧阳', 'ōu yáng'), s('司马', 'sī mǎ'), s('上官', 'shàng guān'),
  s('诸葛', 'zhū gě'), s('令狐', 'lìng hú'), s('慕容', 'mù róng'),
  s('东方', 'dōng fāng'), s('独孤', 'dú gū'), s('皇甫', 'huáng fǔ'),
  s('尉迟', 'yù chí'), s('公孙', 'gōng sūn'), s('长孙', 'zhǎng sūn'),
  s('宇文', 'yǔ wén'), s('夏侯', 'xià hóu'), s('澹台', 'tán tái'),
  s('南宫', 'nán gōng'), s('西门', 'xī mén'), s('轩辕', 'xuān yuán'),
  s('拓跋', 'tuò bá'), s('赫连', 'hè lián'), s('完颜', 'wán yán'),
  s('耶律', 'yē lǜ'), s('闾丘', 'lǘ qiū'), s('司徒', 'sī tú'),
  s('司空', 'sī kōng'), s('太史', 'tài shǐ'), s('端木', 'duān mù'),
  s('公冶', 'gōng yě'), s('宗政', 'zōng zhèng'), s('濮阳', 'pú yáng'),
  s('淳于', 'chún yú'), s('单于', 'chán yú'), s('百里', 'bǎi lǐ'),
  s('东郭', 'dōng guō'), s('呼延', 'hū yán'), s('羊舌', 'yáng shé'),
  s('微生', 'wēi shēng'), s('梁丘', 'liáng qiū'), s('左丘', 'zuǒ qiū'),
  s('仲孙', 'zhòng sūn'),
]

export const SURNAMES = [...SINGLE_SURNAMES, ...COMPOUND_SURNAMES]

export const SURNAME_MAP = SURNAMES.reduce(
  (acc, item) => ({ ...acc, [item.char]: item }),
  {},
)

// 姓氏选择器的取值：空串＝不加姓，两个星号＝按范围随机
export const NO_SURNAME = ''
export const RANDOM_ANY = '**'
export const RANDOM_SINGLE = '**single'
export const RANDOM_COMPOUND = '**compound'

export const SURNAME_PRESETS = [
  { value: NO_SURNAME, label: '不加姓' },
  { value: RANDOM_ANY, label: '随机姓氏' },
  { value: RANDOM_SINGLE, label: '随机单姓' },
  { value: RANDOM_COMPOUND, label: '随机复姓' },
]

// 把选择器的取值解析成候选池；返回 null 表示这次不加姓
export function surnamePool(value) {
  if (!value) return null
  if (value === RANDOM_ANY) return SURNAMES
  if (value === RANDOM_SINGLE) return SINGLE_SURNAMES
  if (value === RANDOM_COMPOUND) return COMPOUND_SURNAMES
  const fixed = SURNAME_MAP[value]
  return fixed ? [fixed] : null
}

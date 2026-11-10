# 《恨长沙》法文译本风格底本（Perdu à Changsha / FR）

> 与 `STYLE-EN.md` 同源，只做法语适配。中文原文为唯一真源：`chapters/henchangsha/<num>.json`。

## 0. 目标

法语读者读到的应是一部**法国书店里能卖的中国当代小说**：句子清楚、节奏偏短、对白自然，
不端文学奖的架子，也不带翻译腔（calque）。时态以 passé composé / imparfait 叙事，
不用 passé simple（太文）。

## 1. 硬性结构规则

1. **段落一一对应**：中文 N 段 → 法文 N 段，不合并不拆分不增删。
2. 章标题：`Prologue : Kunpeng`、`Chapitre un : Le Hibou`、`Chapitre deux : Guanguan`……
   数字用法语单词（un, deux, trois… quarante-quatre）。
3. 引号用法语规范 `« »`（内层 `“ ”`）；省略号 `…`；破折号 `—`。
4. 数字用阿拉伯数字；货币保留人民币 `yuans`（`2 millions de yuans`）。绝不换欧元。
5. 成语俗语译意不译形；不解释中国文化（不加「在中国……」式旁白）。

## 2. 文体细则

- 句子 12–20 词；中文逗号长串拆成法语短句或用分号。
- 避免名词化堆叠（`la réalisation de` → 动词）。被动少用。
- 对白：中年男人之间可用 `tu`；体制内/商务场合用 `vous`。**同一人物关系里 tu/vous 必须前后一致**，
  不因句子方便而换。
- 不补写心理、不加比喻；中文有的细节一个不丢。

## 3. 人名与称呼

| 中文 | 法文 |
|---|---|
| 郑智咏 | Zheng Zhiyong（后文 `Zheng`） |
| 老郑 | le vieux Zheng（首次出现加一次轻解释：`le vieux Zheng — c'est ainsi que ses amis l'appelaient depuis vingt ans`） |
| 郑总 | monsieur Zheng |
| 郑工 | l'ingénieur Zheng |
| 陆游 / 老陆 / 陆总 | Lu You / le vieux Lu / monsieur Lu |
| 刁可鑫 / 刁总 | Diao Kexin（后文 `Diao`）/ madame Diao |
| 张靖雨 | Zhang Jingyu（后文 `Jingyu`） |
| 高飞 | Gao Fei |
| 从莎莎 | Cong Shasha（后文 `Shasha`） |
| 吴主任 / 吴优 | le directeur Wu / Wu You |
| 王处 | le chef de section Wang |
| 肖静 / 肖博 | Xiao Jing / le docteur Xiao |
| 燕儿总 / 燕儿姐 | madame Yan / sœur Yan（按原文区分，不混用） |
| 小雅 | Xiaoya |
| 朱奕文 | Zhu Yiwen |

职务类推：主任→directeur，处→chef de section，总→monsieur/madame，工→ingénieur。

## 4. 机构与术语

西北工业大学 → Université polytechnique du Nord-Ouest；北清大学 → université de Beiqing；
湘南大学 → université de Xiangnan；航天五院 → la cinquième Académie de l'aérospatiale；
六院 → la sixième Académie；北斗 → Beidou；望京 SOHO → Wangjing SOHO；
停薪留职 → congé sans solde en conservant son poste；预研 → recherche préalable；
竞标 → appel d'offres；列装 → entrée en service；实缴 → capital libéré；
应收账款 → créances clients；厅级干部 → cadre de rang départemental；
学区房 → un logement dans un bon secteur scolaire；大平层 → un grand appartement de plain-pied；
龙凤胎 → des jumeaux, un garçon et une fille；清酒 → saké；毛豆 → edamames.

## 5. 四十五只神兽（固定译名）

0 Kunpeng｜1 Le Hibou｜2 Guanguan｜3 Hundun｜4 Tao｜5 L'Aigle｜6 Le Gu｜7 Neuf Nourrissons
8 Qiongqi｜9 Taotie｜10 L'Oiseau aux ailes jumelles｜11 Le Chien céleste｜12 Le Phénix
13 Fei｜14 Zheng｜15 Zhu Yan｜16 Huo Dou｜17 Ying Zhao｜18 L'Oiseau Chongming
19 Dang Kang｜20 Fuzhu｜21 Le Poisson Ling｜22 Fei Yi｜23 Lu Shu｜24 Le Poisson Ying
25 Huan｜26 Bifang｜27 Lu Wu｜28 Le Renard à neuf queues｜29 Yayu｜30 Zhu Huai｜31 Mo
32 Jingwei｜33 Le Poisson pourpre｜34 Jiao｜35 Yu｜36 Le Poisson Ru rouge｜37 Bingfeng
38 Juru｜39 Le Cheval céleste｜40 Ao｜41 Xiqu｜42 Mengji｜43 Heyu｜44 Zhujian

## 6. 神兽小传（bio）

结构：`« Nom » — <出处/释名>。<一句形貌>。<一句暗扣本章人物处境，不点破情节>。`
《山海经》→ `le Classique des montagnes et des mers`；《庄子·逍遥游》→
`le Zhuangzi, chapitre « Libre et facile errance »`。不虚构经名。

## 7. 交稿自检

段数相等、无空段、无残留汉字、专名与本表一致、数字金额一致、
`chars` = 段落字符数之和、JSON 可解析、键序 work/num/lang/languageLabel/direction/title/sourceTitle/beast/bio/paragraphs/paragraphCount/chars。

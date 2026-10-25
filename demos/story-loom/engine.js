// Original fictional texts. Structural editing is deterministic, not AI literary judgment.
const card=(id,voice,time,title,text,motif,optional=false,needs=[])=>({id,voice,time,title,text,motif,optional,needs});
export const STORIES=[
 {id:'balcony',title:'借来的阳台',subtitle:'离开之前，要把花放在哪里？',place:'一幢即将翻修的楼 · 秋日下午',motif:'空花盆',voices:{A:{name:'林夏',role:'即将搬走的住客'},B:{name:'周伯',role:'楼下修伞的人'}},
  brief:'林夏要离开这幢楼。周伯从不收别人送的东西，却每天替她看一眼阳台。今天，她试着不说“送给你”。',
  cards:[
   card('A1','A','15:00','纸箱之外','我把最后一本书塞进纸箱。阳台上的空花盆没有位置；它一直空着，却比有花的时候更难带走。','空花盆'),
   card('A2','A','15:20','不是赠送','我把花盆放到修伞摊边，压一张纸：“借你一个春天。”没写归期，怕这句话又变成告别。','借',false,[]),
   card('A3','A','16:00','留一格空白','搬家清单上，我没有划掉花盆。那一格空白像另一种地址，暂时不用知道门牌。','空花盆',true),
   card('A4','A','17:00','回头看一眼','我看见纸条背面的“好”，才把钥匙交出去。出门时没往楼上看：这一次，楼下也有我留下的东西。','回头',false,['B2']),
   card('B1','B','14:50','伞骨','最后一根伞骨修好了。我抬头看看三楼，空花盆还在。她搬走以后，那块阴影会不会也一起搬走？','空花盆'),
   card('B2','B','15:40','一个字的回信','我把摊边的花盆搬进来，在“借你一个春天”背后写“好”。一个字很轻，搁在空盆里却像一粒种子。','借',false,['A2']),
   card('B3','B','16:20','多留一把椅子','收摊时，我没把第二把椅子叠起来。等一株植物长出来，或者等一个人坐下，都需要一点空地方。','回头',true),
   card('B4','B','17:10','不替它命名','我往空花盆里添了一捧土，没种花。等下个春天来的人，应该有权决定这是什么花。','空花盆')],
  initial:['A1','B1','B2','A2','A3','B3','B4','A4'],
  endings:{A:{title:'离开，也是一种安放',text:'故事停在交出的钥匙上。读者先知道楼下会添土，再陪林夏离开；“借”让告别不必被撤销。'},B:{title:'春天拥有了一个空位',text:'故事停在尚未命名的花上。林夏已离开，周伯却为下一次相见保留选择；等待成为最后一个动作。'},quiet:{title:'没有说出的归期',text:'你省去了两段内心独白，只留下交接与行动。读者能确认这次借用成立，却不能确认他们是否在等待重逢。'}}},
 {id:'rehearsal',title:'停电后的第三拍',subtitle:'当台词消失，谁接住停顿？',place:'社区小剧场 · 演出前一晚',motif:'第三拍',voices:{A:{name:'阿澈',role:'总抢拍的演员'},B:{name:'许页',role:'第一次执导的编剧'}},
  brief:'剧场临时停电。阿澈习惯用台词填满沉默，许页写的最后一场却只有三拍停顿。他们得决定：空白算不算演出的一部分。',
  cards:[
   card('A1','A','19:00','熟悉的抢拍','我把最后一句背得太熟，总在第三拍之前开口。许页没有打断我，只把铅笔横放在剧本上。','第三拍'),
   card('A2','A','19:12','敲出一个空位','灯灭了。我在椅背敲两下，第三下只抬起手。第一次，我没有用“还有人在吗”填满黑暗。','第三拍'),
   card('A3','A','19:20','没说出口的旧习惯','小时候家里一安静，我就背课文。我从来没想过，台上也可以有一种不会被赶走的安静。','安静',true),
   card('A4','A','19:35','照着空白演','我看见她用手电照着的空白页，明白最后一句被删了。我朝观众席鞠躬，在第三拍之后。','空白页',false,['B2']),
   card('B1','B','18:55','纸上的呼吸','我在剧本末尾写“停三拍”。印刷店问是不是漏字，我说不是，回来却偷偷数了一遍。','第三拍'),
   card('B2','B','19:16','删掉替代台词','听见两下敲击之后的停顿，我划掉备用的最后一句，把空白页照给阿澈看。不是他忘词，是我们终于肯停下。','空白页',false,['A2']),
   card('B3','B','19:25','不催灯亮','电工说还要十分钟。我把手电调暗一点，没有问能不能快一些；排练第一次不需要追赶什么。','安静',true),
   card('B4','B','19:40','把停顿写进去','灯重新亮起，我在演出单上加了一行：“本剧包含一小段完整的安静。”这一次，空白也署了名。','第三拍')],
  initial:['A1','B1','A2','B3','A3','B2','A4','B4'],
  endings:{A:{title:'一个人终于不抢拍',text:'演出单先写好，故事才落在阿澈的鞠躬上。改变的分量来自他的身体：不是忘词，而是主动等到了第三拍。'},B:{title:'让空白也署名',text:'鞠躬之后，编剧把停顿写进演出单。私人默契变成公开的创作决定，最后留在纸上的反而是安静。'},quiet:{title:'一段无法解释的安静',text:'删去两段内心独白后，停顿仍然成立，但它的来处不再被说明。读者只能从敲击、空白页和鞠躬之间感受信任。'}}},
 {id:'bakery',title:'把配方留在门外',subtitle:'味道要一模一样，还是可以不同？',place:'河边的小面包房 · 开门之前',motif:'半勺盐',voices:{A:{name:'沈陶',role:'交接面包房的师傅'},B:{name:'小满',role:'准备独自开店的徒弟'}},
  brief:'沈陶要交出店门钥匙。小满把用了十年的配方改了半勺盐，又把改动留在台面上。今天的交接，不能只靠一句“照旧就好”。',
  cards:[
   card('A1','A','04:30','旧配方','我把油渍透过的配方从墙上取下。背面有十年前第一次烤焦的日期，那天也有人把钥匙放进我的手里。','配方'),
   card('A2','A','05:00','留出一个位置','我把钥匙挂在空面粉袋上，告诉小满：“今天你决定。”说完把自己常站的那块地让了出来。','钥匙'),
   card('A3','A','05:35','手的记忆','我下意识伸手去拿盐罐，又收回来。手比我更晚知道：交接不是教完最后一步，是允许另一双手伸过来。','半勺盐',true),
   card('A4','A','06:05','带走半块面包','我读完她留在台面的新配方，掰走半块面包。门外的风把热气吹向我；味道不同，我没有回头补那半勺盐。','半勺盐',false,['B2']),
   card('B1','B','04:40','不敢改的数字','我在草稿上把盐减了半勺，重新划回去。那张配方比我来得更早，好像每一个数字都已经有了姓名。','半勺盐'),
   card('B2','B','05:20','写下自己的半勺','听完“今天你决定”，我把新配方留在台面：少半勺盐，多一点发酵时间。没有藏起旧配方，两张纸可以挨着。','配方',false,['A2']),
   card('B3','B','05:45','留着一块旧招牌','我把旧招牌擦干净，准备挂回原处。换一种味道，不一定要换掉所有来时的路。','钥匙',true),
   card('B4','B','06:10','第一炉不是复制','我独自打开店门，把“今日：小满的第一炉”写在黑板上。下一位客人进来时，我准备好告诉他：今天有一点不一样。','配方')],
  initial:['B1','A1','A2','B2','A4','B3','A3','B4'],
  endings:{A:{title:'带着不同的味道离开',text:'新店已经开门，故事才回到师傅手里的半块面包。传承不是复制；他的最后一个动作，是不再替对方补盐。'},B:{title:'第一炉，用自己的名字',text:'师傅先走，徒弟最后开门。配方的改变成为明确的署名；这不是失传，而是第一次独立的创作。'},quiet:{title:'两张配方挨在一起',text:'你省去了收回的手和留下的招牌。交接仍然完整，但依恋不被直说；旧与新的关系，留给读者从两张纸之间体会。'}}}
];
export function getStory(id){const s=STORIES.find(s=>s.id===id);if(!s)throw new Error('未知故事');return s;}
export function createState(id=STORIES[0].id){const s=getStory(id);return {version:1,storyId:s.id,order:[...s.initial],omitted:[],focus:'both',edits:{}};}
export function normalizeState(input){if(!input||input.version!==1)throw new Error('不支持的稿件版本');const s=getStory(input.storyId),ids=s.cards.map(c=>c.id);if(!Array.isArray(input.order)||input.order.length!==ids.length||new Set(input.order).size!==ids.length||input.order.some(id=>!ids.includes(id)))throw new Error('卡片顺序不完整');if(!Array.isArray(input.omitted)||new Set(input.omitted).size!==input.omitted.length||input.omitted.some(id=>!ids.includes(id)))throw new Error('留白记录无效');if(!['both','A','B'].includes(input.focus))throw new Error('视角无效');const edits={};if(input.edits&&typeof input.edits==='object')for(const [id,value]of Object.entries(input.edits)){if(!ids.includes(id)||typeof value!=='string'||value.length>1500)throw new Error('改写内容无效');edits[id]=value;}return{version:1,storyId:s.id,order:[...input.order],omitted:[...input.omitted],focus:input.focus,edits};}
export function activeCards(state){const s=getStory(state.storyId);return state.order.filter(id=>!state.omitted.includes(id)).map(id=>s.cards.find(c=>c.id===id));}
export function swapCards(state,a,b){if(a===b||!state.order.includes(a)||!state.order.includes(b)||state.omitted.includes(a)||state.omitted.includes(b))return state;const next=structuredClone(state),ai=next.order.indexOf(a),bi=next.order.indexOf(b);[next.order[ai],next.order[bi]]=[next.order[bi],next.order[ai]];return next;}
export function moveCard(state,id,delta){const active=activeCards(state).map(c=>c.id),i=active.indexOf(id),j=i+delta;if(i<0||j<0||j>=active.length)return state;return swapCards(state,id,active[j]);}
export function toggleOmit(state,id){if(!getStory(state.storyId).cards.some(c=>c.id===id))return state;const next=structuredClone(state);next.omitted=next.omitted.includes(id)?next.omitted.filter(x=>x!==id):[...next.omitted,id];return next;}
export function evaluate(state){const story=getStory(state.storyId),cards=activeCards(state),pos=Object.fromEntries(cards.map((c,i)=>[c.id,i])),issues=[],links=[];
 for(const c of story.cards){if(!c.optional&&state.omitted.includes(c.id))issues.push({type:'missing',ids:[c.id],text:`“${c.title}”是必要桥段；省略后，${story.voices[c.voice].name}的行动缺少起点或落点。`});}
 for(const voice of ['A','B']){const track=cards.filter(c=>c.voice===voice);for(let i=1;i<track.length;i++){const a=track[i-1],b=track[i];if(a.time>b.time)issues.push({type:'time',ids:[a.id,b.id],text:`${story.voices[voice].name}的“${b.title}”(${b.time})排在“${a.title}”(${a.time})之后；本篇约定同一声道不倒叙。`});}}
 for(const c of cards)for(const need of c.needs){const from=story.cards.find(n=>n.id===need),ok=pos[need]!==undefined&&pos[need]<pos[c.id];links.push({from:need,to:c.id,ok,label:`${from.title} → ${c.title}`});if(!ok)issues.push({type:'knowledge',ids:[need,c.id],text:`“${c.title}”要先读到“${from.title}”：人物不能回应尚未出现的行动。`});}
 let switches=0,maxRun=cards.length?1:0,run=maxRun;for(let i=1;i<cards.length;i++){if(cards[i].voice!==cards[i-1].voice){switches++;run=1;}else run++;maxRun=Math.max(maxRun,run);}
 const echoes=[];for(let i=1;i<cards.length;i++)if(cards[i].voice!==cards[i-1].voice&&cards[i].motif===cards[i-1].motif)echoes.push({ids:[cards[i-1].id,cards[i].id],motif:cards[i].motif});
 const a=cards.filter(c=>c.voice==='A').length,b=cards.length-a;const optional=story.cards.filter(c=>c.optional),quiet=optional.every(c=>state.omitted.includes(c.id));const last=cards.at(-1)?.voice||'A',ending=quiet?story.endings.quiet:story.endings[last];
 const rhythm=cards.length<2?'桥段太少，还听不出声道之间的呼吸。':maxRun>=3?`最长连续 ${maxRun} 张同声道，让一个人拥有较长独白；另一个声音稍后才接入。`:`${switches} 次声道切换，最长连续 ${maxRun} 张同声道；两个人的动作较紧密地互相照见。`;
 const focus=state.focus==='both'?'双声道等重：读者同时拥有两人的信息，理解可以比人物更早发生。':`把${story.voices[state.focus].name}放在前景：另一声道仍然保留，但读者更贴近这位叙述者的离开、犹豫与选择。`;
 return{coherent:issues.length===0,issues,links,rhythm,switches,maxRun,echoes,counts:{A:a,B:b},ending:{key:quiet?'quiet':last,...ending},focus,edited:Object.keys(state.edits).length};}
export function exportText(state){const s=getStory(state.storyId),r=evaluate(state);return`${s.title}｜双声道小说\n${s.place}\n视角：${state.focus==='both'?'双声道':s.voices[state.focus].name}\n结构校读：${r.coherent?'因果与同声道时间成立':`${r.issues.length} 处待调整`}\n\n${activeCards(state).map((c,i)=>`${i+1}. ${c.title} · ${s.voices[c.voice].name} ${c.time}\n${state.edits[c.id]??c.text}`).join('\n\n')}\n\n——${r.coherent?r.ending.title:'这版尚未合拢'}——\n${r.coherent?r.ending.text:r.issues.map(i=>i.text).join('\n')}\n\n${r.focus}\n注：结构校读不分析改写后的语义。原创虚构故事 / MIT。\n`;}
export const RECIPES={both:['A1','B1','A2','B2','A3','B3','A4','B4'],aLast:['B1','A1','A2','B2','B3','B4','A3','A4'],quiet:['A1','B1','A2','B2','A3','B3','A4','B4']};

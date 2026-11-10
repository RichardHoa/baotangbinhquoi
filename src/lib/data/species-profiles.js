/**
 * The written part of each species profile, keyed by species key. Kept apart
 * from the components so the survey team can revise the texts on their own.
 *
 * `name` gives a Vietnamese name to species whose survey title is scientific.
 * Species not confirmed to species level (`cf.`) are written about by genus.
 */

/**
 * @typedef {Object} SpeciesProfileText
 * @property {string} [name] Vietnamese name, where the survey gives none
 * @property {string} text 2–4 sentences on appearance, behaviour and habitat
 */

/** @type {Record<string, SpeciesProfileText>} */
export const SPECIES_PROFILES = {
	// Chim
	'common-moorhen': {
		text: 'Chim nước cỡ vừa, bộ lông xám đen với vệt trắng dọc sườn, mỏ đỏ chóp vàng nối liền với mảng trán đỏ. Kịch vừa bơi vừa gật gù đầu, nhặt thực vật thủy sinh, hạt và côn trùng ở mép nước, khi bị động thì chạy lướt trên mặt nước hoặc lủi vào bụi rậm. Chúng sống ở ao, hồ sen, đầm lầy và kênh rạch nhiều cây thủy sinh.'
	},
	'ashy-tailorbird': {
		text: 'Chim nhỏ có đầu và mặt màu hung đỏ, lưng và ngực xám tro, đuôi thường vểnh lên. Chúng chuyền cành nhanh nhẹn trong tán lá rậm để bắt sâu bọ và hay cất tiếng kêu to, dồn dập. Loài này ưa rừng ngập mặn, rừng dừa nước và các vườn cây ven sông.'
	},
	'collared-kingfisher': {
		text: 'Chim bói cá cỡ vừa, lưng và cánh xanh lam ánh lục, bụng trắng và một vòng khoang trắng quanh cổ. Chúng đậu yên trên cành hoặc cọc cao rồi lao xuống bắt cua, cá, côn trùng và thằn lằn, kêu to thành chuỗi “chéo chẹt”. Loài này phổ biến ở rừng ngập mặn, bãi bồi và vườn cây ven sông rạch.'
	},
	'coppersmith-barbet': {
		text: 'Chim nhỏ, thân mập, lưng xanh lục, ngực vàng nhạt có sọc, trán và một mảng ngực đỏ tươi. Tiếng kêu “póc… póc…” lặp đều như tiếng gõ kim loại, thường vang lên từ ngọn cây cao. Chúng ăn quả, nhất là quả sung và si, và khoét lỗ trên cành khô để làm tổ ở vườn, công viên và rìa rừng.'
	},
	'plain-prinia': {
		text: 'Chim nhỏ màu nâu xám nhạt, bụng vàng hung, đuôi dài thường vểnh lên và vẫy qua lại. Chúng len lỏi trong bụi cỏ và lau sậy, vừa chuyền vừa kêu líu ríu để tìm sâu bọ. Loài này sống ở bãi cỏ, ruộng, lau sậy và cây bụi ven nước.'
	},
	'sunda-pied-fantail': {
		text: 'Chim nhỏ có lưng nâu xám, họng trắng, một dải đen ngang ngực và đuôi dài viền trắng. Chúng liên tục xòe đuôi như chiếc quạt và nhảy xoay người để lùa côn trùng ra rồi đớp giữa không trung. Loài này ưa rừng ngập mặn, vườn cây và bụi rậm gần nước.'
	},
	'brown-throated-sunbird': {
		text: 'Chim nhỏ có mỏ hơi cong; con đực có đầu và lưng ánh xanh lục tím, họng nâu và bụng vàng, con cái màu ô liu với bụng vàng nhạt. Chúng bay chuyền giữa các khóm hoa để hút mật và bắt côn trùng nhỏ. Loài này phổ biến ở vườn cây, rừng ngập mặn và rìa rừng ven sông.'
	},
	'common-iora': {
		text: 'Chim nhỏ có ngực và bụng vàng tươi, cánh đen với hai vạch trắng. Chúng chuyền trong tán lá để bắt sâu bọ và có tiếng hót huýt kéo dài. Loài này sống ở vườn cây, rừng thưa, rừng ngập mặn và cây bụi.'
	},
	'golden-bellied-gerygone': {
		text: 'Một trong những loài chim nhỏ nhất trên bán đảo, lưng nâu xám, bụng vàng chanh và một vệt trắng nhỏ trước mắt. Chúng tìm côn trùng nhỏ trên ngọn cây và có tiếng hót cao, rỉ rả. Loài này ưa rừng ngập mặn, vườn cây và rìa rừng ven sông.'
	},
	'scaly-breasted-munia': {
		text: 'Chim sẻ nhỏ màu nâu, ngực và bụng trắng phủ vảy nâu sẫm, mỏ ngắn và dày màu xám đen. Chúng sống theo đàn, ăn hạt cỏ và lúa, thường đậu thành hàng trên thân cỏ. Loài này phổ biến ở bãi cỏ, ruộng lúa, vườn và khu dân cư.'
	},

	// Bò sát
	'trimeresurus-albolabris': {
		name: 'Rắn lục mép trắng',
		text: 'Rắn độc cỡ vừa, thân xanh lục tươi, đầu hình tam giác và môi trên màu trắng hoặc vàng nhạt, chóp đuôi thường nâu đỏ. Chúng hoạt động chủ yếu về đêm, nằm phục trên cành cây để rình ếch nhái, thằn lằn và chuột. Loài này sống ở bụi cây, vườn và rừng thứ sinh gần nước; nọc của chúng gây nguy hiểm nên cần giữ khoảng cách.'
	},
	'ahaetulla-fusca': {
		name: 'Rắn roi',
		text: 'Rắn thân mảnh và dài như sợi roi, đầu nhọn, mắt lớn có con ngươi nằm ngang. Chúng leo trèo trên cành cây và bụi rậm vào ban ngày, rình bắt thằn lằn và ếch nhái. Rắn roi có nọc độc nhẹ, ít nguy hiểm với người, và sống ở vườn cây, bụi rậm và rìa rừng.'
	},
	'calotes-cf-irawadi': {
		name: 'Nhông',
		text: 'Một loài nhông thuộc chi Calotes, chưa được xác định chắc chắn đến loài. Các loài nhông có thân dẹp bên, đuôi dài, hàng vảy gai dọc sống lưng và có thể đổi màu; con đực thường có đầu và họng đỏ vào mùa sinh sản. Chúng phơi nắng và rình bắt côn trùng trên thân cây, hàng rào và bụi cây ở vườn và các bãi đất trống.'
	},
	'hemidactylus-frenatus': {
		name: 'Thạch sùng đuôi sần',
		text: 'Thằn lằn nhỏ màu xám hoặc nâu nhạt, da hơi trong, đuôi có những hàng gai nhỏ. Chúng hoạt động về đêm, bò trên tường và trần nhà nhờ các bản bám dưới ngón chân, bắt côn trùng bị ánh đèn thu hút và kêu “chặc chặc”. Loài này sống quanh nhà ở, công trình và cả trên thân cây.'
	},
	'takydromus-sexlineatus': {
		name: 'Liu điu chỉ',
		text: 'Thằn lằn thân mảnh với chiếc đuôi rất dài, có thể dài gấp ba lần thân, lưng nâu có các sọc chạy dọc. Chúng hoạt động ban ngày, len lỏi nhanh trong đám cỏ cao để bắt côn trùng. Loài này sống ở bãi cỏ, ruộng và cây bụi thấp.'
	},
	'hemidactylus-platyurus': {
		name: 'Thạch sùng đuôi dẹp',
		text: 'Thạch sùng có thân và đuôi dẹp, hai bên sườn và chân có nếp da mỏng giúp chúng áp sát vào bề mặt. Chúng hoạt động về đêm, rình bắt côn trùng quanh nguồn sáng. Loài này sống trên tường nhà, vách công trình và thân cây.'
	},

	// Lưỡng cư
	'kaloula-pulchra': {
		name: 'Ễnh ương thường',
		text: 'Thân tròn mập, lưng nâu sẫm với một dải màu nâu nhạt đến vàng chạy từ mắt dọc hai bên sườn. Sau những cơn mưa lớn, con đực phồng túi kêu vang “ễnh ương” từ các vũng nước để gọi bạn tình. Chúng sống ở vườn, ruộng và quanh nhà, ban ngày vùi mình dưới đất hoặc trong hốc.'
	},
	'duttaphrynus-melanostictus': {
		name: 'Cóc nhà',
		text: 'Cóc cỡ vừa, da sần sùi nhiều mụn, có gờ xương màu đen trên đầu và hai tuyến lớn sau mắt. Chúng kiếm ăn kiến, mối và côn trùng vào ban đêm, thường tụ tập dưới ánh đèn. Cóc nhà sống gần người, ở vườn, ruộng và quanh nhà; nhựa tiết ra từ da có độc.'
	},
	'microhyla-ninhthuanensis': {
		name: 'Nhái bầu Ninh Thuận',
		text: 'Loài nhái rất nhỏ, đầu nhỏ, thân hình giọt nước, lưng nâu với hoa văn sẫm. Loài này mới được mô tả năm 2021 và trước đó dễ bị nhầm với các loài nhái bầu gần giống. Chúng sống trong thảm cỏ và lá mục gần vũng nước, con đực kêu rỉ rả sau mưa.'
	},
	'polypedates-megacephalus': {
		name: 'Ếch cây mép trắng',
		text: 'Ếch cây cỡ vừa, thân thon, màu nâu vàng đến xám, thường có sọc sẫm chạy dọc lưng, đầu ngón có đĩa bám lớn. Chúng sống trên cây và bụi gần nước, ban đêm kêu và đẻ trứng trong những ổ bọt treo trên cành phía trên mặt nước. Loài này thích nghi tốt với vườn cây, ao hồ và khu dân cư.'
	},
	'fejervarya-moodiei': {
		name: 'Ếch cua',
		text: 'Ếch cỡ vừa, lưng nâu xám có nhiều nốt sần và vết sẫm, chân sau có màng bơi. Loài này chịu được nước lợ, ban đêm bắt côn trùng, cua nhỏ và các động vật nhỏ khác. Chúng sống ở rừng ngập mặn, ruộng và kênh rạch chịu ảnh hưởng của thủy triều.'
	},
	'hoplobatrachus-chinensis': {
		name: 'Ếch đồng',
		text: 'Ếch lớn, da lưng có nhiều gờ dọc, màu nâu xanh với các đốm sẫm. Chúng săn mồi tham ăn, bắt côn trùng, cua, cá nhỏ và cả ếch nhái khác. Ếch đồng sống ở ruộng lúa, ao, mương và đầm lầy.'
	}
};

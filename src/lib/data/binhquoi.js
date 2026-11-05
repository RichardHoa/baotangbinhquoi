/**
 * Dữ liệu Bán đảo Thanh Đa - Bình Quới (Bình Quới Eco-Museum)
 * Tọa độ trung tâm: [10.8223127, 106.7437338]
 */

export const MAP_CENTER = [10.8223127, 106.7437338];
export const DEFAULT_ZOOM = 15;

/**
 * Tọa độ ranh giới uốn lượn của Bán đảo Thanh Đa - Bình Quới
 * Được bao bọc 3 mặt bởi sông Sài Gòn và 1 mặt bởi Kênh Thanh Đa.
 */
export const PENINSULA_BOUNDARY = [
	[10.8035, 106.7178], // Cầu Kinh Thanh Đa (mạn Nam kênh)
	[10.8075, 106.7155], // Ven Kênh Thanh Đa
	[10.814, 106.7135], // Ven Kênh Thanh Đa
	[10.821, 106.712], // Ngã ba Kênh Thanh Đa & Sông Sài Gòn (phía Tây Bắc)
	[10.8265, 106.7128], // Khúc quanh sông Sài Gòn đối diện Bình Triệu
	[10.832, 106.7152], // Bờ sông phía Tây Bắc
	[10.8368, 106.7195], // Mũi Tây Bắc (đối diện Hiệp Bình Chánh)
	[10.8398, 106.726], // Bờ sông phía Bắc
	[10.8415, 106.7335], // Đỉnh phía Bắc bán đảo
	[10.8412, 106.742], // Bờ sông mạn Đông Bắc
	[10.8395, 106.751], // Gần Làng Bình Quới 2
	[10.8362, 106.7575], // Mũi nhọn Đông Bắc (đối diện Linh Đông, Thủ Đức)
	[10.8305, 106.7602], // Ven sông phía Đông
	[10.824, 106.7595], // Bến đò Bình Quới
	[10.8175, 106.7548], // Vùng ven sông phía Đông Nam
	[10.8115, 106.7485], // Đối diện Thảo Điền (Quận 2)
	[10.8055, 106.741], // Khúc quanh Thảo Điền - Thanh Đa
	[10.8018, 106.7325], // Mũi phía Nam bán đảo
	[10.8015, 106.724], // Cửa vào kênh Thanh Đa (phía Đông Nam)
	[10.8035, 106.7178] // Khép góc tại Cầu Kinh Thanh Đa
];

/**
 * Danh mục địa điểm
 */
export const CATEGORIES = [
	{ id: 'all', nameVi: 'Tất cả', nameEn: 'All', icon: 'compass' },
	{ id: 'heritage', nameVi: 'Di sản & Văn hóa', nameEn: 'Heritage & Culture', icon: 'landmark' },
	{ id: 'nature', nameVi: 'Sinh thái & Vườn cảnh', nameEn: 'Ecology & Parks', icon: 'leaf' },
	{ id: 'ferry', nameVi: 'Bến đò & Sông nước', nameEn: 'Rivers & Ferries', icon: 'anchor' },
	{ id: 'culinary', nameVi: 'Ẩm thực khẩn hoang', nameEn: 'Culinary Heritage', icon: 'utensils' },
	{ id: 'history', nameVi: 'Ký ức & Kiến trúc', nameEn: 'History & Architecture', icon: 'history' }
];

/**
 * Các điểm di sản & không gian bảo tàng nổi bật tại Bình Quới
 */
export const POI_LIST = [
	{
		id: 'binhquoi-1',
		name: 'Làng Du Lịch Bình Quới 1',
		category: 'heritage',
		coords: [10.8252, 106.7482],
		tagVi: 'Văn hóa Nam Bộ',
		tagEn: 'Southern Heritage',
		heroImage:
			'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
		summaryVi:
			'Khu sinh thái văn hóa tái hiện bức tranh làng quê Nam Bộ trù phú với cầu khỉ, ao sen, nhà tranh rực rỡ sắc màu miền Tây.',
		summaryEn:
			'Cultural ecological sanctuary recreating traditional Southern Vietnamese village life with monkey bridges, lotus ponds, and thatched cottages.',
		detailsVi:
			'Nằm nép mình bên dòng sông uốn lượn, Bình Quới 1 là không gian bảo tồn nét đẹp sông nước phương Nam giữa lòng đô thị. Nơi đây thường xuyên tổ chức ẩm thực "Khẩn Hoang Nam Bộ" với hàng trăm món bánh dân gian truyền thống.',
		detailsEn:
			'Nestled along the winding river, Binh Quoi 1 preserves southern riverine heritage amidst the city, famous for traditional culinary festivals with hundreds of folk delicacies.',
		address: '1147 Đường Bình Quới, Phường 28, Bình Thạnh, TP.HCM',
		highlights: [
			'Buffet Khẩn Hoang',
			'Cầu khỉ bắc qua ao sen',
			'Thuyền ghe văn hóa Nam Bộ',
			'Không gian dã ngoại bờ sông'
		]
	},
	{
		id: 'binhquoi-2',
		name: 'Làng Du Lịch Bình Quới 2',
		category: 'nature',
		coords: [10.8375, 106.7558],
		tagVi: 'Mũi đón gió sông',
		tagEn: 'Riverside Cape',
		heroImage:
			'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
		summaryVi:
			'Tọa lạc tại mỏm cực đông bắc bán đảo với tầm nhìn ngoạn mục bao quát ngã ba sông Sài Gòn lộng gió.',
		summaryEn:
			'Situated at the northeastern cape of the peninsula with panoramic views overlooking the windy Saigon River confluence.',
		detailsVi:
			'Bình Quới 2 sở hữu hệ thống bungalow nghỉ dưỡng ven sông rợp bóng dừa nước, nơi lưu giữ sự yên ả hiếm thấy. Khu vực này còn lưu giữ nhiều vạt dừa nước tự nhiên - loài thực vật bản địa kiên cường của hệ sinh thái đất ngập nước.',
		detailsEn:
			'Features tranquil riverside bungalows shaded by nipa palms, preserving rare peace and resilient native mangrove flora along the river banks.',
		address: 'Cuối đường Bình Quới, Phường 28, Bình Thạnh, TP.HCM',
		highlights: [
			'Mũi đón gió ngắm hoàng hôn',
			'Rừng dừa nước ngập mặn tự nhiên',
			'Nhà hàng du thuyền ven sông',
			'Hồ bơi hướng sông Sài Gòn'
		]
	},
	{
		id: 'binhquoi-3',
		name: 'Khu Du Lịch Bình Quới 3 (Quán Xưa)',
		category: 'culinary',
		coords: [10.8198, 106.7412],
		tagVi: 'Không gian hoài niệm',
		tagEn: 'Nostalgic Garden',
		heroImage:
			'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
		summaryVi:
			'Không gian ấm cúng mộc mạc mang phong vị đồng quê yên bình với các món ngon gia truyền phương Nam.',
		summaryEn:
			'A rustic nostalgic culinary retreat offering authentic home-cooked southern recipes surrounded by lush gardens.',
		detailsVi:
			'Quán Xưa tái hiện không khí những gian nhà xưa ba gian hai chái, chái bếp đỏ lửa và tiếng chuông gió rì rào dưới bóng cây cổ thụ ven sông.',
		detailsEn:
			'Evokes old traditional wooden houses, hearth cookery, and wind chimes echoing beneath centuries-old trees along the river bank.',
		address: '1019 Đường Bình Quới, Phường 28, Bình Thạnh, TP.HCM',
		highlights: [
			'Ẩm thực gia truyền',
			'Vườn kiểng cổ thụ',
			'Không gian họp mặt gia đình',
			'Bến thuyền vọng cảnh'
		]
	},
	{
		id: 'bendo-binhquoi',
		name: 'Bến Đò Bình Quới - Linh Đông',
		category: 'ferry',
		coords: [10.8258, 106.7592],
		tagVi: 'Ký ức đò ngang',
		tagEn: 'Historic River Ferry',
		heroImage:
			'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
		summaryVi:
			'Bến đò ngang lịch sử nối liền ốc đảo Bình Quới với TP. Thủ Đức, phương thức di chuyển sông nước trăm năm.',
		summaryEn:
			'Historic passenger ferry linking the Binh Quoi island with Thu Duc City, an enduring century-old waterway route.',
		detailsVi:
			'Trước khi có các cây cầu hiện đại, đò ngang là linh hồn giao thương kết nối cư dân Bình Quới với bờ Đông sông Sài Gòn. Mỗi chuyến đò chỉ mất 5 phút nhưng chứa đựng nhịp sống thanh bình, mộc mạc đặc trưng.',
		detailsEn:
			'Before modern bridges were conceived, local ferries served as the lifeline connecting the isolated peninsula to the east bank of Saigon River.',
		address: 'Cuối hẻm Bến Đò, Phường 28, Bình Thạnh, TP.HCM',
		highlights: [
			'Trải nghiệm đi đò ngang truyền thống',
			'Ngắm nhìn toàn cảnh sông Sài Gòn',
			'Nhiếp ảnh đời thường sông nước',
			'Cổng giao lưu Bình Thạnh - Thủ Đức'
		]
	},
	{
		id: 'cau-kinh-thanh-da',
		name: 'Cầu Kinh Thanh Đa & Kênh Đào Lịch Sử',
		category: 'history',
		coords: [10.8038, 106.7175],
		tagVi: 'Cửa ngõ độc đạo',
		tagEn: 'Sole Gateway Bridge',
		heroImage:
			'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80',
		summaryVi:
			'Cây cầu huyết mạch duy nhất kết nối đô thị Bình Thạnh vào bán đảo Thanh Đa bắc qua kênh đào nhân tạo đào từ năm 1897.',
		summaryEn:
			'The sole overland gateway bridge connecting urban Binh Thanh to Thanh Da, crossing a historic canal dug in 1897.',
		detailsVi:
			'Kênh Thanh Đa được người Pháp khởi công đào vào năm 1897 cắt ngang khúc uốn của sông Sài Gòn để rút ngắn 12km đường thủy, vô tình biến phần đất này thành một hòn đảo trù phú độc lập.',
		detailsEn:
			'Thanh Da Canal was excavated in 1897 by French engineers to bypass a 12km bend in the Saigon River, virtually turning Thanh Da into an idyllic island.',
		address: 'Đường Xô Viết Nghệ Tĩnh / Bình Quới, Phường 27 & 28, Bình Thạnh',
		highlights: [
			'Kênh đào nhân tạo hơn 120 năm tuổi',
			'Cửa ngõ duy nhất đường bộ vào đảo',
			'Đài quan sát tàu thuyền qua lại',
			'Vạch ranh giới đô thị hóa và đồng quê'
		]
	},
	{
		id: 'cu-xa-thanh-da',
		name: 'Khu Cư Xá Thanh Đa',
		category: 'history',
		coords: [10.8062, 106.7215],
		tagVi: 'Dấu ấn thập niên 1960',
		tagEn: '1960s Modernist Blocks',
		heroImage:
			'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
		summaryVi:
			'Khu chung cư kiểu mẫu đầu tiên của Sài Gòn xây dựng cuối thập niên 1960 với lối sống cộng đồng đặc sắc.',
		summaryEn:
			'One of the first modernist apartment complexes in Saigon built in the late 1960s with vibrant communal heritage.',
		detailsVi:
			'Cư xá Thanh Đa là một di sản kiến trúc nhà ở tập thể mang tinh thần hiện đại nhiệt đới, nơi lưu giữ phong vị đời sống thị dân Sài Gòn xưa với chợ cóc, quán cà phê vợt và những hàng me cổ thụ.',
		detailsEn:
			'Represents tropical modernist housing heritage of old Saigon, harboring nostalgic neighborhood markets, filter coffee shops, and towering tamarind trees.',
		address: 'Cư xá Thanh Đa, Phường 27, Bình Thạnh, TP.HCM',
		highlights: [
			'Kiến trúc khối chung cư nhiệt đới',
			'Chợ truyền thống Thanh Đa',
			'Văn hóa cà phê cóc ven đường',
			'Cộng đồng gắn kết nhiều thế hệ'
		]
	},
	{
		id: 'dam-sen-sinh-thai',
		name: 'Vườn Sen & Đất Ngập Nước Bình Quới',
		category: 'nature',
		coords: [10.8228, 106.7365],
		tagVi: 'Ốc đảo sinh thái',
		tagEn: 'Wetland Lotus Haven',
		heroImage:
			'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
		summaryVi:
			'Hàng chục héc-ta đầm lầy, hồ sen và vườn dừa nguyên sơ đóng vai trò là "lá phổi xanh" điều hòa khí hậu cho Sài Gòn.',
		summaryEn:
			'Dozens of hectares of pristine lotus ponds, marshes, and coconut groves acting as the green lung of Ho Chi Minh City.',
		detailsVi:
			'Là khu vực chưa bị bê tông hóa, Bình Quới bảo tồn hệ động thực vật đất ngập nước đa dạng: cò trắng, chim bói cá, dừa nước, lục bình và các thảm thực vật bản địa vùng châu thổ.',
		detailsEn:
			'Unpaved and untouched by heavy urbanization, preserving rich wetland biodiversity: white egrets, kingfishers, water hyacinths, and native delta flora.',
		address: 'Khu vực nông trang Phường 28, Bình Thạnh, TP.HCM',
		highlights: [
			'Hồ sen ngát hương mùa hè',
			'Nơi trú ngụ của chim di cư ven sông',
			'Vườn cây ăn trái nhiệt đới',
			'Đường đê nông thôn yên ả'
		]
	},
	{
		id: 'chua-buu-lien',
		name: 'Chùa Bửu Liên & Cổ Tự Bán Đảo',
		category: 'heritage',
		coords: [10.8122, 106.7268],
		tagVi: 'Di tích tâm linh',
		tagEn: 'Spiritual Sanctuary',
		heroImage:
			'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
		summaryVi:
			'Ngôi chùa cổ thanh tịnh nép mình bên bóng mát cây xanh, nơi lưu giữ tín ngưỡng dân gian của cư dân sông nước.',
		summaryEn:
			'A tranquil Buddhist pagoda shaded by old trees, preserving the spiritual traditions of the peninsula community.',
		detailsVi:
			'Không gian tĩnh lặng thoát ly khỏi tiếng còi xe đô thị, kiến trúc mái ngói cong truyền thống kết hợp cảnh quan vườn thiền đậm chất Á Đông.',
		detailsEn:
			'A sanctuary removed from city traffic noise, combining traditional curved roof tile architecture with peaceful contemplative gardens.',
		address: 'Đường Bình Quới, Phường 28, Bình Thạnh, TP.HCM',
		highlights: [
			'Kiến trúc chùa cổ truyền thống',
			'Vườn thiền xanh mát',
			'Không gian tĩnh tâm cho du khách'
		]
	},
	{
		id: 'cong-vien-bo-song',
		name: 'Công Viên Bờ Sông Thanh Đa',
		category: 'nature',
		coords: [10.8048, 106.7352],
		tagVi: 'Không gian cộng đồng',
		tagEn: 'Riverside Promenade',
		heroImage:
			'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1200&q=80',
		summaryVi:
			'Dải công viên ven sông trải dài nhìn sang bán đảo Thảo Điền, điểm hóng mát và ngắm hoàng hôn lý tưởng.',
		summaryEn:
			'Linear riverside park looking across to Thao Dien peninsula, a favorite evening breeze and sunset gathering spot.',
		detailsVi:
			'Vào mỗi buổi chiều, làn gió mát từ sông Sài Gòn thổi qua đem lại không khí trong lành, cư dân đạp xe, đi dạo và ngắm nhìn Landmark 81 từ góc nhìn đối xứng qua dòng nước.',
		detailsEn:
			'Every evening, river breezes sweep across the park while locals jog, cycle, and watch the illuminated Landmark 81 skyline across the water.',
		address: 'Bờ kè Thanh Đa, Phường 27, Bình Thạnh, TP.HCM',
		highlights: [
			'Góc nhìn trực diện Landmark 81',
			'Làn gió sông tự nhiên',
			'Đường dạo bộ ven nước',
			'Trà chanh, ẩm thực vỉa hè về đêm'
		]
	},
	{
		id: 'khong-gian-bao-tang',
		name: 'Trung Tâm Bảo Tàng Sinh Thái & Nghệ Thuật Bình Quới',
		category: 'heritage',
		coords: [10.8312, 106.7455],
		tagVi: 'Không gian trưng bày chính',
		tagEn: 'Main Eco-Museum Pavilion',
		heroImage:
			'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1200&q=80',
		summaryVi:
			'Dự án bảo tàng sống bảo tồn ký ức địa lý, văn hóa khẩn hoang và đa dạng sinh học của hòn đảo ngọc giữa lòng Sài Gòn.',
		summaryEn:
			'A living museum project preserving geographic memories, pioneer settler culture, and biodiversity of the urban green oasis.',
		detailsVi:
			'Không gian mở kết hợp nhà rường gỗ, triển lãm tương tác số và các tour khảo cứu thực địa giúp khách tham quan cảm nhận trọn vẹn giá trị sinh thái đặc hữu của bán đảo.',
		detailsEn:
			'Open pavilion combining traditional timber architecture, digital interactive exhibits, and field nature trails showcasing the delta biosphere.',
		address: 'Tâm điểm bán đảo Bình Quới, Phường 28, Bình Thạnh, TP.HCM',
		highlights: [
			'Phòng trưng bày thực tế ảo',
			'Bản đồ tương tác 3D địa hình bán đảo',
			'Bộ sưu tập nông cụ và cổ vật sông nước',
			'Tọa đàm di sản và hội thảo sinh thái'
		]
	}
];

/**
 * Thống kê nhanh về Bán đảo Bình Quới
 */
export const PENINSULA_STATS = [
	{ labelVi: 'Diện tích bán đảo', labelEn: 'Peninsula Area', value: '426 ha', icon: 'map' },
	{ labelVi: 'Đường bờ sông Sài Gòn', labelEn: 'River Shoreline', value: '14.5 km', icon: 'waves' },
	{ labelVi: 'Tuổi đời Kênh đào', labelEn: 'Canal History', value: '> 125 năm', icon: 'calendar' },
	{
		labelVi: 'Không gian cây xanh & nước',
		labelEn: 'Green & Water Cover',
		value: '~65%',
		icon: 'trees'
	}
];

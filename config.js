module.exports = {
    "baseUrl": 'http://127.0.0.1:3000', //基础url
    "dbPath": './sql.db', //数据库路径
    "userActivityCode": ['A001303'], //活动代码
    "goodsUrl": 'https://page.teshehui.com/page/AP2018KXU19422017', //商品列表网站
    "goodsDetailBaseUrl": 'https://m.teshehui.com/goods/detail', //商品详情页列表
    "listTimeout": 36000000, //大概列表刷新间隔
    "detailListTimeout": 100000, //详细列表刷新间隔
    "selectTimeout": 5000, //选中的详细列表刷新间隔（监控）
	"quantity": 1, //一次下单的数量
	"changeIp": 1, //是否自动换ip，0：不换，1：换
}
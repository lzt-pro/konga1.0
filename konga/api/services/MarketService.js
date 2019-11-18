
var MarketService = {
    headers: function (isJSON) {
        var headers = {};
        if (isJSON) {
            headers = {'Content-Type': 'application/json'}
        }
        return headers;
    },
    login:function (req, res, next) {
        var email = req.body.email;
        var password = req.body.password;
        sails.models.marketuser.findOne({email:email})
            .exec(function (err, user) {
                if(err) return res.negotiate(err);
                if (!user) return res.notFound('用户名不存在');
                if(user.password !== password){
                    return res.notFound('密码错误');
                }
                sails.log.debug("密码查询成功！");
                var payload = {
                    data:user.id,
                    exp:Math.floor(Date.now()/1000) +(60*60*24)
                };
                next(err, {
                    user: user,
                    token: sails.services.markettoken.issue(payload)
                });
            })
    }
};
module.exports = MarketService;
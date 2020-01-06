
var AdminService = {
    login:function (admin, next) {
        var user = admin.user;
        var password = admin.password;
        sails.models.adminuser.findOne({user:user})
            .exec(function (err, entity) {
                if (err) {
                    next(err, entity);
                }else if (!entity) {
                    next({
                        code:"404",
                        msg:"该用户不存在！"
                    }, entity);
                }else if (entity.password !== password){
                    next({
                        code:"404",
                        msg:"密码输入错误！"
                    }, entity);
                }else {
                    sails.log.debug("密码查询成功！");
                    var payload = {
                        data:entity.id,
                        exp:Math.floor(Date.now()/1000) +(60*60*24)
                    };
                    next(err, {
                        admin:entity,
                        token:sails.services.admintoken.issue(payload)
                    });
                }
            })
    }
};
module.exports = AdminService;
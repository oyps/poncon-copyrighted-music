// 后端API基础路径 调用API时可引用该路径

var baseUrl = ''
if (location.hostname == 'localhost') {
    var baseUrl = 'http://app.ouyangpeng.top/app/poncon-copyrighted-music/'
}

var webTitle = '无忧音乐网 - 海量无版权音乐共享'
var userLoginDataKeyName = 'copyrighted_music_UserLoginData'
var UserHasLogin = 0 // 用户已经登录？

var request_updateFileList
    = request_getFileInfo
    = request_playMusic
    = $.ajax()

// 不重复加载的Ajax数据
var neverLoad_getTypeList = 0

// 播放器
var ap

/**
 * 加载音乐播放器，播放音乐
 * @param {string} fileId 音乐文件ID·
 */
function playMusic(fileId) {
    request_playMusic.abort()
    request_playMusic = $.ajax({
        method: 'post',
        url: baseUrl + 'api/getMusicInfo.php',
        data: {
            fileId: fileId
        },
        contentType: 'application/x-www-form-urlencoded',
        dataType: 'json',
        success: function (data) {
            if (data.code == 200) {
                $('.aplayerBox, .goDownloadMusicGood').show().css('position', 'fixed')
                ap = new APlayer({
                    container: document.getElementById('aplayer'),
                    audio: [{
                        name: data.result.fileName.replace(/(.*).mp3$/, '$1'),
                        artist: '无忧音乐网',
                        url: data.result.downloadUrl,
                        cover: 'img/music.jpg',
                        theme: '#17a2b8'
                    }]
                })
                ap.play()
            } else {
                alert(data.msg)
            }
        }
    })
}



/**
 * 加载音乐列表
 * @param {string} type 音乐类型
 * @param {int} page 页码
 * @param {int} pageSize 每页加载数量
 */
function loadMusicList(type, page, pageSize) {
    if (page == 0) {
        $('.page-musicList .musicList').html('')
    }
    $('.page-musicList .loadMore').hide()
    $('.page-musicList .loading').show()
    $('.page-musicList .loadMore button').show()
    $.ajax({
        method: 'post',
        url: baseUrl + 'api/getMusicList.php',
        data: {
            type: type,
            page: page,
            pageSize: pageSize
        },
        contentType: 'application/x-www-form-urlencoded',
        dataType: 'json',
        success: function (data) {
            $('.page-musicList .loading').hide()
            $('.page-musicList .loadMore').show()
            if (data.code == 200) {
                var list = data.result
                if (list.length == 0) {
                    $('.page-musicList .loadMore button').hide()
                    return
                }
                for (var i = 0, html = ''; i < list.length; i++) {
                    html += '<div class="col-xl-3 col-lg-4 col-md-6">\
                                <div class="p-3 rounded shadow border mb-4 musicList-item" data-fileid="' + list[i].fileId + '">\
                                    <h5 class="mb-2 text-mainColor cursor">' + list[i].fileName.replace(/(.*).mp3$/, '$1') + '</h5>\
                                    <div class="msg text-muted cursor small mb-2">' + list[i].msg + '</div>\
                                    <div class="text-nowrap overflow-hidden">\
                                        <span class="bi bi-headphones"></span>\
                                        <span class="listen_num mr-3 mr-sm-2">' + list[i].listen_num + '</span>\
                                        <span class="bi bi-filetype-mp3"></span>\
                                        <span class="fileSize mr-3 mr-sm-2">' + fileSize(list[i].size) + '</span>\
                                        <span class="cursor cursor-warning">\
                                            <span class="bi bi-star"></span>\
                                            <span class="like_num">' + list[i].like_num + '</span>\
                                        </span>\
                                    </div>\
                                </div>\
                            </div>'
                }
                $('.page-musicList .musicList').append(html)
                $('.page-musicList .loadMore button').unbind().click(function () {
                    loadMusicList(type, ++page, pageSize)
                })
                $('.page-musicList .musicList-item h5, .page-musicList .musicList-item .msg').unbind().click(function () {
                    var fileId = $(this).parent().data('fileid')
                    playMusic(fileId)
                })
            } else {

            }
        }
    })
}
/**
 * 转换KB为其他单位
 * @param {int} e 文件大小KB
 * @returns
 */
function fileSize(e) {
    var a = ["B", "KB", "MB", "GB", "TB", "PB"]
    var t = 1024
    for (var i = 0; i < a.length; i++) {
        if (e < t) {
            return (i == 0 ? e : e.toFixed(2)) + a[i]
        }
        e /= t
    }
}
/**
 * 响应路由控制
 * @param {string} hash 页面的hash，如#/home/
 */
function router(hash) {
    // 获取目标界面标识
    hash = hash.split('/')
    var target = hash[1]
    // 交换界面显示
    $('.page-oyp').hide()
    var page = $('.page-' + target)
    page.fadeIn()
    $('.navbar-collapse li.active').removeClass('active')
    $('.navbar-collapse li.nav-item-' + target).addClass('active')

    // 判断目标界面标识 执行对应模块的载入事件
    if (target == 'home') {
        document.title = webTitle
        if (neverLoad_getTypeList) {
            return
        }
        $.ajax({
            method: 'get',
            url: baseUrl + 'api/getTypeList.php',
            contentType: 'application/x-www-form-urlencoded',
            dataType: 'json',
            success: function (data) {
                neverLoad_getTypeList = 1
                var html = ''
                for (var i = 0; i < data.length; i++) {
                    html += '<div class="col-xl-3 col-lg-4 col-6">\
                                <div data-index="' + i + '" class="rounded shadow border p-3 mb-4 border-mainColor text-center musicTypeList-item ' + (i == 0 ? 'musicTypeList-item-active' : '') + '">\
                                    <div class="overflow-hidden">\
                                        <h5 class="text-mainColor mb-0 text-nowrap text-truncate">' + data[i][1] + '</h5>\
                                        <div class="msg text-nowrap text-truncate">' + data[i][0] + '</div>\
                                    </div>\
                                </div>\
                            </div>';
                }
                $('.page-home .musicTypeList').html(html)
                $('.page-home .musicTypeList .musicTypeList-item').unbind().click(function () {
                    var index = $(this).data('index')
                    var item = data[parseInt(index)]
                    location.hash = '/musicList/' + encodeURIComponent(item[0]) + '/' + encodeURIComponent(item[1]) + '/'
                })
            }
        })
    } else if (target == 'about') {
        document.title = '关于 - ' + webTitle
        // 界面载入事件
        // ...
    } else if (target == 'search') {
        document.title = '音乐搜索 - ' + webTitle
    } else if (target == 'login') {
        if (hash[2] == 'register') {
            page.find('input').val('')
            page.find('.page-sub-register').show()
            page.find('.title').html('用户注册')
            document.title = '用户注册 - ' + webTitle
        } else {
            page.find('.page-sub-login').show()
            page.find('.title').html('用户登录')
            document.title = '用户登录 - ' + webTitle
        }
    } else if (target == 'musicList') {
        var typeKey = decodeURIComponent(hash[2])
        var typeName = decodeURIComponent(hash[3])
        document.title = typeName + ' - 音乐列表 - ' + webTitle
        $('.page-musicList .breadcrumb .active').html(typeName + ' - 音乐列表')
        loadMusicList(typeKey, 0, 36)
    } else {
        location.hash = '/home/'
    }
}

window.addEventListener('hashchange', function (event) {
    // 监听Hash改变 通过location.hash='xxx'可触发
    var hash = new URL(event.newURL).hash
    router(hash)
})

/**
 * 登陆成功时执行的事件
 */
function hasLogin() {
    UserHasLogin = 1
    $('.navbar-collapse li.nav-item-login').hide()
    $('.navbar-collapse li.nav-item-logout').show()
}

/**
 * 未登录时执行的事件
 */
function notLogin() {
    UserHasLogin = 0
    $('.navbar-collapse li.nav-item-logout').hide()
    $('.navbar-collapse li.nav-item-login').show()
}

/**
 * 判断用户是否已经登录
 * @returns bool
 */
function ifLogin() {
    try {
        var userdata = JSON.parse(localStorage[userLoginDataKeyName])
        if (userdata.username && userdata.password && userdata.email) {
            var success = 0
            $.ajax({
                url: baseUrl + 'api/login.php',
                method: 'post',
                data: {
                    username: userdata.username,
                    password: userdata.password
                },
                success: function (data) {
                    if (data.code == 200) {
                        // 登录成功
                        hasLogin()
                        localStorage[userLoginDataKeyName] = JSON.stringify(data.result)
                        success = 1
                    } else {
                        notLogin()
                        success = 0
                    }
                },
                async: false
            })
            if (success) {
                return true
            } else {
                return false
            }
        } else {
            notLogin()
            return false
        }
    } catch (error) {
        notLogin()
        return false
    }
}





$(document).ready(function () {
    console.log('%cHello Poncon 2022-05-07', 'color: orange; border: 2px solid orange; padding: 2px 4px; font-size: 16px;')
    if (!location.hash.split('/')[1]) {
        history.replaceState({}, null, '#/home/')
    }
    router(location.hash)

    ifLogin()

    /**
     * 收集并验证表单
     * @param {object} data 空对象，用于存储表单数据
     * @param {int} mode 验证模式，1:验证整个注册页表单 2: 跳过验证码字段
     * @returns 
     */
    function validation_register(data, mode) {
        data.username = $('.page-login .page-sub-register .input-username').val()
        data.email = $('.page-login .page-sub-register .input-email').val()
        data.password = $('.page-login .page-sub-register .input-password').val()
        var password2 = $('.page-login .page-sub-register .input-password2').val()
        data.verCode = $('.page-login .page-sub-register .input-verCode').val()
        if (!data.username.match(/^\w{4,20}$/)) {
            alert('用户名要求长度为4-20，只能包含数字、字母和下划线')
            return false
        } else if (!data.email.match(/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/)) {
            alert('邮箱不合法')
            return false
        } else if (!data.password.match(/^\w{8,20}$/)) {
            alert('密码要求长度为8-20，只能包含数字、字母和下划线')
            return false
        } else if (data.password != password2) {
            alert('两次输入的密码不一致')
            return
        } else if (!data.verCode && mode == 1) {
            alert('请输入验证码')
            return false
        }
        return true
    }

    $('.page-login .page-sub-register button.register').click(function () {
        var data = {}
        if (!validation_register(data, 1)) {
            return
        }
        var username = data.username
        var password = data.password
        $.ajax({
            method: 'post',
            url: baseUrl + 'api/register.php',
            data: {
                username: username,
                password: md5(password),
                email: data.email,
                verCode: data.verCode
            },
            contentType: 'application/x-www-form-urlencoded',
            dataType: 'json',
            success: function (data) {
                if (data.code == 200) {
                    location.hash = '/login/'
                    console.log(username, password)
                    $('.page-login .page-sub-login .input-username').val(username)
                    $('.page-login .page-sub-login .input-password').val(password)
                } else {

                }
                alert(data.msg)
            }
        })
    })

    $('.page-login .page-sub-register button.getVerCode').click(function () {
        var data = {}
        if (!validation_register(data, 2)) {
            return
        }
        var ele = $(this)
        ele.attr('disabled', 'disabled')
        $.ajax({
            method: 'post',
            url: baseUrl + 'api/getCode.php',
            data: {
                email: data.email
            },
            contentType: 'application/x-www-form-urlencoded',
            dataType: 'json',
            success: function (data) {
                if (data.code == 200) {
                    for (var i = 0; i < 60; i++) {
                        (function (i) {
                            setTimeout(function () {
                                ele.html(60 - i + '秒后重新获取')
                            }, 1000 * i)
                        }(i))
                    }
                    setTimeout(() => {
                        ele.removeAttr('disabled')
                        ele.html('获取验证码')
                    }, 1000 * 60);
                } else {
                    alert(data.msg)
                    ele.removeAttr('disabled')
                    ele.html('获取验证码')
                }
            }
        })
    })

    $('.page-login .page-sub-login button.login').click(function () {
        var username = $('.page-login .page-sub-login .input-username').val()
        var password = $('.page-login .page-sub-login .input-password').val()
        if (!username || !password) {
            alert('账号和密码不能为空')
            return
        } else if ((!username.match(/^\w{4,20}$/)
            && !username.match(/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/))
            || !password.match(/^\w{8,20}$/)) {
            alert('账号或密码格式错误')
            return
        }
        $.ajax({
            method: 'post',
            url: baseUrl + 'api/login.php',
            data: {
                username: username,
                password: md5(password)
            },
            contentType: 'application/x-www-form-urlencoded',
            dataType: 'json',
            success: function (data) {
                if (data.code == 200) {
                    // 登录成功
                    localStorage[userLoginDataKeyName] = JSON.stringify(data.result)
                    location.hash = '/home/'
                    hasLogin()
                } else {
                    alert(data.msg)
                }
            }
        })
    })
    $('.page-login .page-sub-login .input-password').bind('keyup', function (event) {
        if (event.keyCode == 13) {
            $(this).blur()
            $('.page-login .page-sub-login button.login').click()
        }
    })
    $('.page-login .page-sub-register .input-verCode').bind('keyup', function (event) {
        if (event.keyCode == 13) {
            $(this).blur()
            $('.page-login .page-sub-register button.getVerCode').click()
        }
    })
    $('.page-home button.btn-input-file').click(function () {
        $('.page-home input.input-file').click()
    })
    $('.page-home input.input-file').change(function () {
        // 没有登录，无法添加文件，转到登录
        if (!UserHasLogin) {
            location.hash = '/login/'
            $('.page-home input.input-file').val('')
            return
        }
        if (isWorking) {
            $('.page-home input.input-file').val('')
            return
        }
        $('.page-home .btns').show()
        var fileDatas = $(this).prop('files')
        if (!fileDatas.length) {
            $('.page-home input.input-file').val('')
            return
        }

        if (isWorkFinished) {
            isWorkFinished = 0
            // 刚刚完成任务，此时新增文件，直接清空原列表，并恢复按钮
            $('.page-home .workList').html('')
            fileList = []
            $('.page-home button.allUpload').show()
            $('.page-home button.allCancel').html('全部取消')
        }

        addFile(fileDatas)
    })

    $('.nav-item-logout').click(function () {
        if (!confirm('确定要退出登录吗？')) {
            return
        }
        localStorage[userLoginDataKeyName] = ''
        notLogin()
    })
    $('span.goDownloadMusicGood').click(function () {
        if (UserHasLogin) {
            var downloadUrl = ap.options.audio[0].url
            $('.download_iframes').append('<iframe src="' + downloadUrl + '"></iframe>')
            $('.modal-msg').modal('show')
        } else {
            location.hash = '/login/'
        }
    })
    $('body').show()
    $('a').attr('draggable', 'false')
    new ClipboardJS('.copybtn')
})
document.addEventListener('DOMContentLoaded', function () {
  browser.runtime.sendMessage({ type: 'getsetinfo' }).then(function (response) {
    var setinfo = response !== null ? JSON.parse(response) : {
      Run: true,
      GlobalAutoSwitch: true,
      ExcludeUrl: ['www.google.com'],
      OcrType: ['img']
    }
    if (setinfo.ExcludeUrl.indexOf(window.location.host) === -1) {
      const AutoVerify = new AutoCode(setinfo)
      browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        switch (request.cmd) {
          case 'test':
            AutoVerify.Hint(request.value)
            break
          case 'ManualAddImgRule':
            AutoVerify.ManualAddImgRule()
            break
        }
      })
    }
  })
})

class AutoCode {
  constructor (SetInfo = {
    Run: true,
    GlobalAutoSwitch: true,
    ExcludeUrl: [],
    OcrType: []
  }) {
    console.log('[配置信息]', SetInfo)
    var that = this
    // this.injectCustomJs()
    this.Idcard = this.CreateIdcard()
    this.Url = window.location.href
    this.Host = window.location.host
    this.AutoMatic = SetInfo.GlobalAutoSwitch
    this.tipCount = 0
    this.ButtonGroup = '<div id="ButtonGroup" class="autoverify-popover-inner"></div>'
    this.GroupCloseButton = '<svg id="GroupCloseButton" focusable="false" class="" data-icon="close" width="1em" height="1em" fill="currentColor" aria-hidden="true" viewBox="64 64 896 896"><path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 00203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path></svg>'
    this.ManualOcrButton = '<button id="ManualOcrButton" class="autoverify-btn">手动识别</button>'
    this.BackButton = '<button id="BackButton" class="autoverify-btn"">黑名单</button>'
    this.ManullyAddRuleButton = '<button id="ManullyAddRuleButton" class="autoverify-btn"">手动添加规则</button>'
    if (SetInfo.Run) {
      this.Run()
    }
  }

  Run () {
    var that = this
    this.GetLocalRule().then(function (value) {
      for (const key in value) {
        that.WriteRule(value[key])
      }
    }).catch(function () {
      that.GetNetRule().then(function (value) {
        for (const key in value) {
          that.WriteRule(value[key])
          that.SetLocaRule(value[key].idcard, value[key])
        }
      }).catch(function () {
        var Rule = that.CreateImgRule()
        console.log('[生成规则]', Object.keys(Rule).length)
        // 加入黑名单
        for (const key in Rule) {
          that.WriteRule(Rule[key])
          that.UploadNetRule(Rule[key])
        }
        if (Object.keys(Rule).length === 0) {
          console.log('[手动增加]')
          // this.ManualAddImgRule()
        }
      })
    })
  }

  // 注入js
  injectCustomJs (jsPath) {
    jsPath = jsPath || 'js/md5.js'
    var temp = document.createElement('script')
    temp.setAttribute('type', 'text/javascript')
    // 获得的地址类似：browser-extension://ihcokhadfjfchaeagdoclpnjdiokfakg/js/inject.js
    temp.src = browser.extension.getURL(jsPath)
    temp.onload = function () {
      // 放在页面不好看，执行完后移除掉
      this.parentNode.removeChild(this)
    }
    document.body.appendChild(temp)
  }

  // 手动添加规则
  ManualAddImgRule () {
    var that = this
    var idcard = this.Idcard
    var Rule = {
      idcard: idcard,
      back: false,
      img: '',
      input: '',
      source: 0,
      type: 'img',
      status: null,
      url: this.Url
    }
    // 图片右键监听
    that.Hint('请对验证码图片右键')
    $('img').each(function () {
      $(this).on('contextmenu', function () {
        console.log('逻辑处理')
        var img = that.Aimed($(this))
        Rule.img = img
        that.SetLocaRule(idcard, Rule)
        $('img').each(function () {
          $(this).off('on')
        })
        that.OcrImg(that.ConversionBase(img)).then(function (OcrResult) {
          that.Hint('好的下一步左键点击输入框')
          // 输入框点击监听
          $('input').each(function () {
            $(this).click(function () {
              var input = that.Aimed($(this))
              console.log('input', Rule)
              Rule.input = input
              that.SetLocaRule(idcard, Rule)
              // 移除事件
              $('input').each(function () {
                $(this).off('click')
              })
              that.Write(input, OcrResult)
              that.Hint('规则添加完成')
            })
          })
        }).catch(function () {
          that.Hint('识别失败')
        })
      })
    })
  }

  // 创建提示元素
  AddTip () {
    var TipHtml = $('<div id="autocode"></div>').text('Text.')
    TipHtml.css({
      'background-color': 'rgba(211,211,211,0.86)',
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      position: 'fixed',
      color: 'black',
      top: '-2em',
      height: '2em',
      margin: '0em',
      padding: '0em',
      'font-size': '1.2em',
      width: '100%',
      'text-align': 'center',
      'z-index': '999'
    })
    $('body').prepend(TipHtml)
    return TipHtml
  }

  // 通知
  Hint (info) {
    info = info || ''
    console.log('[提示消息]', info)
    var ele = document.createElement('div')
    ele.className = 'autoverify-tip slideInLeft'
    ele.style.top = this.tipCount * 70 + 20 + 'px'
    ele.innerHTML = `<div>${info}</div>`
    document.body.appendChild(ele)
    ele.classList.add('animated')
    this.tipCount++
    setTimeout(() => {
      ele.style.top = '-100px'
      setTimeout(() => {
        ele.remove()
        this.tipCount--
      }, 400)
    }, 3000)
  }

  // 写规则
  WriteRule (Rule) {
    var that = this
    console.log('[执行规则]', Rule)
    switch (Rule.source) {
      case 0:
        console.log('[规则来源]', '本地')
        break
      case 1:
        console.log('[规则来源]', '网络')
        break
    }
    var AutoMatic = ''
    switch (Rule.status) {
      case false:
        console.log('[规则模式]', '手动')
        AutoMatic = Rule.status
        break
      case true:
        console.log('[规则模式]', '自动')
        AutoMatic = Rule.status
        break
      default:
        console.log('[规则模式]', '全局', this.AutoMatic ? '自动' : '手动')
        AutoMatic = this.AutoMatic
    }
    // 名单判断
    if (Rule.back === true) {
      console.log('[规则为黑]')
      return
    }
    console.log('[规则图片]', document.querySelector(Rule.img))
    console.log('[规则输入]', document.querySelector(Rule.input))
    // 添加事件监听
    document.querySelector(Rule.img).addEventListener('mouseover', function (event) {
      $('#ButtonGroup').show()
    })
    // 添加按钮组与关闭按钮
    $(Rule.img).after(this.ButtonGroup)
    $('#ButtonGroup').append(this.GroupCloseButton)
    $('#GroupCloseButton').on('click', function () {
      $('#ButtonGroup').hide()
    })
    // 默认添加
    if ($('#BackButton').length === 0) {
      // 黑名单按钮
      $('#ButtonGroup').append(this.BackButton)
      $('#BackButton').on('click', function () {
        Rule.back = true
        that.UploadNetRule(Rule)
        $('#ButtonGroup').hide()
      })
      if (AutoMatic === true) {
        // 自动模式才会监听
        document.querySelector(Rule.img).onload = function () {
          console.log('[载入完毕]', document.querySelector(Rule.img))
          that.OcrImg(that.ConversionBase(Rule.img)).then(function (OcrResult) {
            that.Write(Rule.input, OcrResult)
          }).catch(function () {
          })
        }
      }
    }
    // 手动模式
    if (AutoMatic === false && $('Manualidentification').length === 0) {
      console.log('[创建按钮]', '手动')
      // 添加手动模式按钮
      $('#ButtonGroup').append(this.ManualOcrButton)
      $('#ManualOcrButton').on('click', function () {
        console.log('[手动识别]', document.querySelector(Rule.img))
        $('#ButtonGroup').hide()
        that.OcrImg(that.ConversionBase(Rule.img)).then(function (OcrResult) {
          that.Write(Rule.input, OcrResult)
        }).catch(function () {
        })
      })
    }
    // var that = this
    if (document.querySelector(Rule.img).complete && AutoMatic === true) {
      that.OcrImg(this.ConversionBase(Rule.img)).then(function (OcrResult) {
        that.Write(Rule.input, OcrResult)
      }).catch(function () {
      })
    }
  }

  // 识别图片类型验证码
  OcrImg (image) {
    return new Promise(function (resolve, reject) {
      browser.runtime.sendMessage({
        method: 'post',
        url: 'http://py.wan7.cc/api/ocr/',
        data: {
          image: image
        }
      }).then(function (response) {
        if (response.status === 200) {
          console.log('[识别结果]', response.data.result.code, response)
          resolve(response.data.result.code)
        }
        if (response.status === 203) {
          console.log('无法识别')
          reject(onerror)
        }
      })
    })
  }

  // 写入操作
  Write (WriteInput, OcrResult) {
    document.querySelector(WriteInput).value = OcrResult
    console.log('[写入完毕]', document.querySelector(WriteInput))
    // WriteInput.value = OcrResult
  }

  // 转换基础
  ConversionBase (img) {
    var image = document.querySelector(img)
    var canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    var ctx = canvas.getContext('2d')
    ctx.drawImage(image, 0, 0, image.width, image.height)
    return canvas.toDataURL('image/jpeg').replace(/^data:image\/jpeg;base64,/, '')
  }

  // 创建身份证
  CreateIdcard () {
    var Card = ''
    $('body').children('div').each(function () {
      Card = Card + ($(this).attr('id') ? '#' + $(this).attr('id') : '') + ($(this).attr('class') ? '.' + $(this).attr('class').replace(/\s/g, '.') : '')
    })
    return md5(Card)
  }

  // 本地清除
  LocalClear () {
    browser.storage.local.clear()
  }

  // 获取网络规则
  GetNetRule (idcard = this.Idcard) {
    return new Promise(function (resolve, reject) {
      browser.runtime.sendMessage({
        method: 'get',
        url: 'http://py.wan7.cc/rule/',
        params: {
          idcard: idcard
        }
      }).then(function (response) {
        console.log('[网络规则]', response.data.length, response)
        if (response.status === 200 && response.data.length !== 0) {
          const NetRule = {}
          response.data.forEach((elem) => {
            // console.log(elem, index);
            elem.source = 1
            NetRule[elem.idcard] = elem
          })
          resolve(NetRule)
        } else {
          reject(onerror)
        }
      })
    })
  }

  // 添加黑名单列表
  UploadNetRule (Rule) {
    console.log('[上传规则]', Rule)
    this.SetLocaRule(Rule.idcard, Rule)
    browser.runtime.sendMessage({
      method: 'post',
      url: 'http://py.wan7.cc/rule/',
      data: Rule
    }).then(function (response) {
      console.log('[上传返回]', response)
    })
  }

  // 设置本地规则
  SetLocaRule (key, value) {
    browser.storage.local.set({ [key]: value })
    // browser.storage.local.get(null).then(function (value) {
    //   console.log('[获取所有]', value)
    // })
  }

  // 获取本地规则
  GetLocalRule (idcard = this.Idcard) {
    return new Promise(function (resolve, reject) {
      browser.storage.local.get([idcard]).then(function (items) {
        if (items[idcard]) {
          resolve({ idcard: items[idcard] })
        } else {
          reject(onerror)
        }
      })
    })
  }

  // 图片类型验证码创建
  CreateImgRule () {
    var that = this
    var Match = {}
    // $("[id!='cheese']")
    $('img').each(function () {
      var EachMatch = {}
      if ($(this).siblings('input').length === 1) {
        var img = that.Aimed($(this))
        var input = that.Aimed($(this).siblings('input'))
        if (img && input) {
          EachMatch = {
            img: img,
            input: input
          }
        }
      } else {
        if ($(this).prev().children('input').length === 1) {
          var img = that.Aimed($(this))
          var input = that.Aimed($(this).prev().children('input'))
          if (img && input) {
            EachMatch = {
              img: img,
              input: input
            }
          }
        }
        if ($(this).next().children('input').length === 1) {
          var img = that.Aimed($(this))
          var input = that.Aimed($(this).next().children('input'))
          if (img && input) {
            EachMatch = {
              img: img,
              input: input
            }
          }
        }
      }
      if (Object.keys(EachMatch).length !== 0) {
        const elem = md5(EachMatch.img)
        EachMatch.img = EachMatch.img.replace(/\s+/g, '')
        EachMatch.input = EachMatch.input.replace(/\s+/g, '')
        EachMatch.url = that.Url
        EachMatch.idcard = that.Idcard
        EachMatch.elem = elem
        EachMatch.status = null
        EachMatch.source = 0
        EachMatch.type = 'img'
        EachMatch.back = false
        // 保存到本地
        that.SetLocaRule(EachMatch.idcard, EachMatch)
        Match[elem] = EachMatch
      }
    })
    if (Object.keys(Match).length === 0) {
      var elem = md5('back')
      var EachMatch = {
        img: '',
        input: '',
        url: that.Url,
        idcard: that.Idcard,
        elem: elem,
        status: null,
        source: 0,
        type: 'img',
        back: true
      }
      that.SetLocaRule(EachMatch.idcard, EachMatch)
      Match[elem] = EachMatch
    }
    return Match
  }

  // 生成id
  Aimed (Element) {
    Element = Element[0]
    var ElementLocalName = Element.localName
    var Symbol = (Element.id ? '#' : Element.className ? '.' : false)
    if (!Symbol) {
      return this.Climb(Element.parentNode, ElementLocalName)
    } else {
      return this.Climb(Element, ElementLocalName)
    }
  }

  // 爬层级
  Climb (Element, ElementLocalName, Joint = '') {
    // console.log('上次过来值' + Joint);
    var ElementType = (Element.id ? Element.id : Element.className ? Element.className.replace(/\s/g, '.') : false)
    var Symbol = (Element.id ? '#' : Element.className ? '.' : false)
    if (ElementType && ElementLocalName === Element.localName) {
      var Address = ElementLocalName + Symbol + ElementType
    } else {
      var Address = Symbol + ElementType + ' ' + ElementLocalName
    }
    // console.log('我叫' + Address);
    // console.log('叫这个名字的有' + $(Address).length);
    if ($(Address).length === 1) {
      // console.log('只有一个' + Address);
      // console.log('最后一次拼接' + Address + ' ' + Joint);
      return Address + ' ' + Joint
      // 我的名字唯一
    } else {
      // console.log(Element);
      // console.log('这是我的父辈' + $(Element).parent()[0].className);
      // 让我的父辈去一辈一辈问我的老祖宗是谁
      var Joint = this.Climb($(Element).parent()[0], $(Element).parent()[0].localName, Address + ' ' + Joint)
      return Joint
    }
  }
}

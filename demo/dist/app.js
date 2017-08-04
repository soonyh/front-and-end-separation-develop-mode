/*
 * @Author: AII-O2P
 * @Date:   2016-03-03 22:38:05
 * @Last Modified time: 2016-09-06 17:35:06
 */
var App = function() {
    var globalSet = function() {
        $.fn.modal.defaults.spinner = $.fn.modalmanager.defaults.spinner = '<div class="loading-spinner" style="width: 200px; margin-left: -100px;">' + '<div class="progress progress-striped active">' + '<div class="progress-bar" style="width: 100%;"></div>' + '</div>' + '</div>';
        toastr.options = {
            positionClass: 'toast-bottom-right',
            closeButton: true,
            timeOut: 3500,
        }
        $(document).ajaxError(function(event, xhr, settings, thrownError) {
            toastr.error(App.i18n('CNF00000009')); //请求失败      
        });
    };
    var showMask = function() {
        $('body').modalmanager('loading');
    };
    var handleUniform = function() {
        if (!jQuery().uniform) {
            return;
        }
        var test = $("input[type=checkbox]:not(.toggle), input[type=radio]:not(.toggle, .star)");
        if (test.size() > 0) {
            test.each(function() {
                if ($(this).parents(".checker").size() == 0) {
                    $(this).show();
                    $(this).uniform();
                }
            });
        }
    };
    var handleTooltips = function() {
        $('.tooltips').tooltip();
    };
    var handlePopover = function() {
        $('[data-toggle="popover"]').popover();
    };
    /**
     * 全选按钮的class必须为group-checkable，其他checkbox的class为“.checkboxes”
     * 全选按钮必须设置data-set="#dt .checkboxes"
     * '#dt'为父层的id，建议用id，避免同一个页面有多组而相互干扰
     */
    var handleCheckBox = function() {
        //.group-checkable为全选按钮的样式
        $('body').on('change', '.group-checkable', function() {
            var set = jQuery(this).attr("data-set");
            var checked = jQuery(this).is(":checked");
            $(set).each(function() {
                var disabled = $(this).is(':disabled');
                if (checked) {
                    $(this).prop("checked", true);
                    $(this).parents('tr').addClass("active");
                } else if (!disabled) {
                    $(this).prop("checked", false);
                    $(this).parents('tr').removeClass("active");
                }
            });
            $.uniform.update(set);
        });
        $('body').on('change', '.checkboxes', function() {
            $(this).parents('tr').toggleClass("active");
        });
        $('body').on('click', '.radios', function() {
            $(this).closest('tbody').find('.radios').each(function() {
                $(this).prop("checked", false);
                $(this).parents('tr').removeClass("active");
                $.uniform.update(this);
            })
            $(this).prop("checked", true).parents('tr').addClass("active");
            $.uniform.update(this);
        });
    };
    return {
        init: function() {
            globalSet();
            App.transferI18nRes();
            handleCheckBox();
            handleUniform();
            handlePopover();
            handleTooltips();
            App.validator();
        },
        /**
         * [validator description]
         * 这个插件的校验基础是markup必须符合bootstrap风格，即div.form-group>input
         * @param  {[type]} selector [选择器，可以是id或class]
         * @return {[type]}       [description]
         */
        validator: function() {
            var errorHandler = function(element, message) {
                // if ($(element).closest('.form-group').hasClass('has-error')) {
                //     return
                // }
                //默认父元素.form-group，且error-placement的值指向的是.form-group的子元素
                var $formGroup = $(element).closest('.form-group');
                if ($(element).attr('error-placement') && $(element).attr('error-placement').length > 0) {
                    $formGroup.children($(element).attr('error-placement')).html('<div class="help-block">' + message + '</div>');
                } else {
                    if (!$formGroup.hasClass('has-error')) {
                        $(element).after('<div class="help-block">' + message + '</div>')
                    } else {
                        $formGroup.find('.help-block').html(message)
                    }
                }
                $formGroup.addClass('has-error');
            };
            var successHandler = function(element) {
                if (!$(element).closest('.form-group').hasClass('has-error')) {
                    return
                }
                $(element).closest('.form-group').removeClass('has-error');
                $(element).closest('.form-group').find('div.help-block').remove();
            };
            var methods = {
                //校验特殊字符
                checkString: function(element) {
                    var value = $(element).val();
                    var isString = !/[`~!@#\$%\^\&\*\(\)\+<>\?:"\{\},\.\\\/;'\[\]]/im.test(value);
                    if (isString && value != '') {
                        successHandler(element);
                    } else {
                        errorHandler(element, App.i18n('PTL10000026'))
                    }
                },
                //跟Input位置有关系,位置有关系,位置有关系
                compare: function(element) {
                    var currentInputName = $(element).attr('name');
                    var currentInputVal = $(element).val();
                    var left, right;
                    var $inputs = $(element).closest('tr').find('input');
                    left = +($inputs.eq(2).val());
                    right = +($inputs.eq(3).val());
                    console.log(left);
                    console.log(right);
                    if (left > 0 && right > left) {
                        successHandler(element);
                    } else {
                        errorHandler(element, 'End value must be greater than start value')
                    }
                    // }
                },
                //跟Input位置有关系,位置有关系,位置有关系
                compare2: function(element) {
                    var currentInputName = $(element).attr('name');
                    var currentInputVal = $(element).val();
                    var left, right, firstLeft, prevRight, lastRight, nextLeft, position;
                    var $currTr = $(element).closest('tr');
                    var $inputs = $currTr.find('input');
                    var left = +($inputs.eq(0).val());
                    var right = +($inputs.eq(1).val());
                    if ($currTr.prev('tr').size() == 0 && $currTr.next('tr').size() == 0) {
                        position = 'single'; //就一行
                    } else if ($currTr.prev('tr').size() == 0 && $currTr.next('tr').size() > 0) {
                        position = 'top'; // 不止1行，但这是第一行
                    } else if ($currTr.prev('tr').size() > 0 && $currTr.next('tr').size() == 0) {
                        position = 'bottom'; // 不止1行，但这是最后一行
                    } else if ($currTr.prev('tr').size() > 0 && $currTr.next('tr').size() > 0) {
                        position = 'middle'; // 不止1行，但这是在中间
                    }
                    if (position == 'single') {
                        console.log('only one tr');
                        if (left != 0) {
                            errorHandler(element, 'Start value must be 0.')
                        } else if (right != -1) {
                            errorHandler(element, 'End value must be -1.')
                        } else {
                            successHandler(element);
                        }
                    } else if (position == 'top') {
                        console.log('this is first tr')
                        if (left != 0) {
                            errorHandler(element, 'Start value must be 0.')
                        } else if (right < left) {
                            errorHandler(element, 'Right value must be greater than left value.')
                        } else {
                            successHandler(element);
                        }
                    } else if (position == 'bottom') {
                        console.log('this is bottom tr');
                        prevRight = $currTr.prev('tr').find('input').eq(1).val();
                        if (left != prevRight) {
                            errorHandler(element, 'Left value must equal to the right side of the above.')
                        } else if (right != -1) {
                            errorHandler(element, 'End value must be -1.')
                        } else if (left < 0) {
                            errorHandler(element, 'On the left side of the value must be greater than zero.')
                        } else {
                            successHandler(element);
                        }
                    } else if (position == 'middle') {
                        console.log('>3 tr, and this is middle tr')
                        prevRight = +$currTr.prev('tr').find('input').eq(1).val();
                        nextLeft = +$currTr.next('tr').find('input').eq(0).val();
                        console.log('right' + right)
                        console.log('nextLeft' + nextLeft)
                        if (left != prevRight) {
                            errorHandler(element, 'Left value must equal to the right side of the above.')
                        } else if (right != nextLeft) {
                            errorHandler(element, 'Right value must equal to the left side of the below.')
                        } else if (right < left) {
                            errorHandler(element, 'Right value must be greater than left value.')
                        } else {
                            successHandler(element);
                        }
                    }
                },
                checkNumber: function(element) {
                    var value = $(element).val();
                    var isNumber = /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value);
                    if (isNumber && value != '') {
                        successHandler(element);
                    } else {
                        errorHandler(element, 'Please enter a valid number.')
                    }
                },
                required: function(element) {
                    var value = $(element).val();
                    if (value != '') {
                        successHandler(element);
                    } else {
                        errorHandler(element, 'This field is required.')
                    }
                },
                bothRequired: function(element) {
                    var arr = [];
                    var isValid = true;
                    $(element).closest('.form-group').find(':input').each(function(index, el) {
                        if ($(this).val() == '') {
                            isValid = false;
                            return false;
                        };
                    });
                    if (isValid) {
                        successHandler(element);
                    } else {
                        errorHandler(element, 'This field is required.')
                    }
                }
            };
            $('body').on('change', ':input[stype],input[optional]', function() {
                var $this = $(this);
                var stype = $this.attr('stype');
                if ($(this).val() == '') {
                    successHandler(this);
                    return
                }
                switch (stype) {
                    case 'string':
                        methods.checkString(this);
                        break;
                    case 'number':
                        methods.checkNumber(this);
                        break;
                    case 'compare':
                        methods.compare(this);
                        break;
                    case 'compare2':
                        methods.compare2(this);
                        break;
                    case 'required':
                        methods.required(this);
                        break;
                    case 'bothRequired':
                        methods.bothRequired(this);
                        break;
                }
            })
            $('body').on('blur', ':input[stype],input[optional]', function() {
                var $this = $(this);
                var stype = $this.attr('stype');
                if ($(this).val() == '') {
                    successHandler(this);
                    return
                }
                switch (stype) {
                    case 'string':
                        methods.checkString(this);
                        break;
                    case 'number':
                        methods.checkNumber(this);
                        break;
                    case 'compare':
                        methods.compare(this);
                        break;
                    case 'compare2':
                        methods.compare2(this);
                        break;
                    case 'required':
                        methods.required(this);
                        break;
                    case 'bothRequired':
                        methods.bothRequired(this);
                        break;
                }
            })
        },
        i18n: function(code) {
            var value = "";
            if (window.lang && code) {
                value = window.lang[code];
            }
            return value;
        },
        isString : function(value) {
            return '[object String]' == Object.prototype.toString.call(value);
        },
        transferI18nRes: function(parent) {
            var i18nSpan;
            if (parent && parent.length) {
                i18nSpan = $(parent + " .i18n");
            } else {
                i18nSpan = $(".i18n");
            }
            var text;
            i18nSpan.each(function(idx, item) {
                item = $(item);
                text = $.trim(item.text());
                if (text) {
                    item.text(App.i18n(text + ""));
                }
                if (item.attr('i18n-set') && App.isString(item.attr('i18n-set'))) {
                    var attribute = item.attr('i18n-set');
                    var code = item.attr(attribute);
                    item.attr(attribute, App.i18n(code + ""));
                }
            });
        },
        getUniqueID: function(prefix) {
            return prefix + '_' + Math.floor(Math.random() * (new Date()).getTime());
        },
        /*
          调用方法：App.modal(options),remote和local必须选填一个，分别表示远程数据和本地数据
          width: [选填] 可选值：[full、container、w700],表示modal的不同宽度
          remote: [必选其一] 类型：url, 远程页面的url
          local: [必选其一] 类型：jquery对象，指向本地数据源
          data: [选填] 传递过来的参数,以'myData'保存在$modal上
        */
        modal: function(options) {
            var options = $.extend(true, {}, options);
            var id = App.getUniqueID('modal');
            var tmpl = ['<div class="modal fade" tabindex="-1" data-modal-overflow="true">', '</div>'];
            tmpl[0] = '<div id="' + id + '" class="modal ' + (options.width ? options.width : '') + ' fade" tabindex="-1">';
            if (options.remote) {
                $('body').modalmanager('loading');
                $('body').append(tmpl[0] + tmpl[1]);
                $('#' + id).load(options.remote, function(response, status, xhr) {
                    if (status == 'success') {
                        /*modal显示的时候，会自动清除loading。
                         *因为远程页面中可能还有存在ajax请求，所以挪到远程页面中执行
                         */
                        // $this.modal();
                        $('#' + id).on('hidden.bs.modal', function() {
                            setTimeout(function() {
                                $('#' + id).remove();
                                //$('body').removeData('modalmanager')
                            }, 350)
                        })
                    } else if (status == 'error') {
                        setTimeout(function() {
                            $('#' + id).remove();
                        }, 350)
                    }
                });
            } else if (options.local != '') {
                // tmpl = tmpl.join('');
                $(options.local).modal();
            }
            var data = (options.data ? options.data : [])
            console.log('modal got data:' + data);
            $('#' + id).data('myData', data);
        },
        ajaxInit: function() {
            $('[data-toggle="tooltip"]').tooltip({
                html: true
            });
            $('[data-toggle="popover"]').popover({
                trigger: 'hover',
                html: true
            });
            $('[data-hover="dropdown"]').dropdownHover({
                delay: 0
            });
            handleUniform();
            handleCheckBox();
        },
        initUniform: function(els) {
            if (els) {
                jQuery(els).each(function() {
                    if ($(this).parents(".checker").size() == 0) {
                        $(this).show();
                        $(this).uniform();
                    }
                });
            } else {
                handleUniform();
            }
        },
        handleDatePickers: function() {
            if (jQuery().datepicker) {
                $('.date-picker').datepicker({
                    autoclose: true
                });
            }
        },
        // wrapper function to scroll(focus) to an element
        scrollTo: function(el, offeset) {
            var pos = (el && el.size() > 0) ? el.offset().top : 0;
            if (el) {
                if ($('body').hasClass('page-header-fixed')) {
                    pos = pos - $('.header').height();
                }
                pos = pos + (offeset ? offeset : -1 * el.height());
            }
            jQuery('html,body').animate({
                scrollTop: pos
            }, 'slow');
        },
        scrollTop: function() {
            App.scrollTo();
        },
        getURLParameter: function(paramName) {
            var searchString = window.location.search.substring(1),
                i, val, params = searchString.split("&");
            for (i = 0; i < params.length; i++) {
                val = params[i].split("=");
                if (val[0] == paramName) {
                    return unescape(val[1]);
                }
            }
            return null;
        },
        /**
         * 取.serialize()序列化后里面某个key对应的value
         * @param  {[type]} str       [序列化后的整个字符串]
         * @param  {[type]} paramName [key名]
         * @return {[type]}           [返回值]
         */
        getParameter: function(str, paramName) {
            var searchString = str,
                i, val, params = searchString.split("&");
            for (i = 0; i < params.length; i++) {
                val = params[i].split("=");
                if (val[0] == paramName) {
                    return unescape(val[1]);
                }
            }
            return null;
        },
        // "a=2&b=3&c=4" 序列化成 {a:2,b:3,c:4}
        serialize: function(str) {
            //修复 jquery.serialize() 会把空格转成'+'的坑
            var str = str.replace(/\+/g, " ");
            var obj = {};
            var params = str.split('&');
            for (var i = 0; i < params.length; i++) {
                var val = params[i].split("=");
                //多选的select，在jquery.serialize()的时候名称都是相同的，如右：rules=1&rules=3
                //这个时候需要把值以数组的形式保存，如右：rules：[1,3]
                if (obj[val[0]]) {
                    var arr = [];
                    arr.push(obj[val[0]]); //读取已存在的，保存到临时数组
                    arr.push(unescape(val[1]));
                    obj[val[0]] = arr;
                } else {
                    obj[val[0]] = unescape(val[1])
                }
            }
            return obj
        },
        isObject: function(obj) {
            return Object.prototype.toString.call(obj) === "[object Object]";
        },
        /**
         * artTemplate的template()进一步封装
         * @param  {[type]}   url         [必填，请求json数据的地址]
         * @param  {[type]}   tmplID      [必填，模板的ID]
         * @param  {[type]}   containerID [必填，容器ID]
         * @param  {Function} callback    [选填，成功的回调函数]
         * @param  {[object]} data  [选填，传参,{key:value}]
         */
        template: function(url, tmplID, containerID, params, callback) {
            var params, cb;
            if (arguments[3] && App.isObject(arguments[3])) {
                params = arguments[3];
            }
            if (arguments[3] && $.isFunction(arguments[3])) {
                cb = arguments[3];
                params = {};
            }
            if (arguments[4] && $.isFunction(arguments[4])) {
                cb = arguments[4];
            }
            $.ajax({
                url: url,
                type: 'post',
                dataType: 'json',
                data: params,
            }).done(function(data) {
                if (!App.checker(data.health)) {
                    if ($("body").data("modalmanager")) {
                        var modalmanager = $("body").data("modalmanager");
                        if (modalmanager.isLoading) {
                            modalmanager.removeLoading();
                            $('.modal').remove();
                        }
                    }
                    return
                };
                var html = template(tmplID, data);
                $('#' + containerID).html(html).data('cb', data);
                cb(data);
            })
        },
        /**
         * [checker description]
         * @param  {[object]} health [顶级health对象]
         * @param  {[boolen]} isToastr [是否弹窗]
         * @return {[boolen]} [code=1表示成功，返回true,继续执行外部的代码
         * code=其他，表示失败，读取error.message并toastr]
         */
        checker: function(error, isToastr) {
            var isToastr = isToastr || true,
                _toastr = function() {
                    if (isToastr) {
                        toastr.error(error.message);
                    }
                };
            switch (error.code) {
                case 1:
                    console.log('health and continue');
                    return true;
                default:
                    _toastr();
                    console.log('not health');
                    return false;
                    break;
            }
        },
        handlePopover: function() {
            $('[data-toggle="popover"]').popover();
        },
        urls: {
            platformList: 'resources/components/platformList.shtml', // 加载平台选择模板，返回所有平台
            productDetail: 'resources/components/productDetail.shtml', //加载产品详情模板
            offerDetail: 'resources/components/offerDetail.shtml', //加载offer详情模板
            basicTariff4PdtOfr: 'resources/components/basicTariff4PdtOfr.shtml', //定价计划charge type
            recurringCharge4PdtOfr: 'resources/components/recurringCharge4PdtOfr.shtml', //定价计划charge type
            ratingDiscount4PdtOfr: 'resources/components/ratingDiscount4PdtOfr.shtml', //定价计划charge type
            oneTimeCharge4PdtOfr: 'resources/components/oneTimeCharge4PdtOfr.shtml', //定价计划charge type
            billingDiscount4PdtOfr: 'resources/components/billingDiscount4PdtOfr.shtml', //定价计划charge type
            freeResource4PdtOfr: 'resources/components/freeResource4PdtOfr.shtml', //
            settlementaggregationRule: 'resources/components/settlementAggregationRule.shtml', //settlement type
            settlementRecurringRule: 'resources/components/settlementRecurringRule.shtml', //settlement type
            settlementOneTimeChargeRule: 'resources/components/settlementOneTimeChargeRule.shtml', //settlement type
            settlementRules: 'resources/components/settlementRules.shtml', //settlement type
            settlementRulesDataTmpl: 'settlementRulesDataTmpl.json', //settlementRules.shtml页面
            product: './mock/product.json', //同步product，返回查询到的product
            offer: './mock/offer.json', //同步offer，返回查询到的offer           
            platformListData: './mock/platformListData.json', //返回平台列表数据
            sync: './mock/sync.json',
            systemList: './mock/systemList.json',
            productDetailData: './mock/productDetailData.json',
            offerDetailData: './mock/offerDetailData.json',
            basicTariff4PdtOfrData: './mock/basicTariff4PdtOfrData.json',
            recurringCharge4PdtOfrData: './mock/recurringCharge4PdtOfrData.json',
            ratingDiscount4PdtOfrData: './mock/ratingDiscount4PdtOfrData.json',
            freeResource4PdtOfrData: './mock/freeResource4PdtOfrData.json',
            oneTimeCharge4PdtOfrData: './mock/oneTimeCharge4PdtOfrData.json',
            billingDiscount4PdtOfrData: './mock/billingDiscount4PdtOfrData.json',
            settlementAggregationRuleData: 'resources/components/settlementAggregationRuleData.json', //settlement type
            settlementRecurringRuleData: 'resources/components/settlementRecurringRuleData.json', //settlement type
            settlementOneTimeChargeRuleData: 'resources/components/settlementOneTimeChargeRuleData.json', //settlement type
            settlementRulesData: 'resources/components/settlementRulesData.json', //settlement type
            saveSettlementRuleForm: 'saveSettlementRuleForm.jsp', //保存SettlementRecurringRule提价表单
            //cacheobj  缓存工程
            cacheList: './mock/cacheList.json', //messageFlow/getCacheStrategyList.shtml
            cacheObjList: './mock/cacheObjList.json', //messageFlow/getCacheStrategyById.shtml
            cacheDelById: 'messageFlow/delCacheStrategyById.shtml',
            cacheAddStrategy: '/messageFlow/addCacheStrategy.shtml',
            cacheUpdateStrategy: '/messageFlow/updateCacheStrategy.shtml',
            //rti
            settlementRule: 'resources/components/settlementRule.shtml',
            settlementRuleData: 'settlementRuleData.json',
            approval: 'resources/components/approval.shtml',
            approvalData: 'approvalData.json',
            saveApproval: 'saveApproval.json',
            viewRtiRuleContent: 'resources/components/viewRtiRuleContent.shtml',
            viewRtiRuleContentData: 'viewRtiRuleContentData.json',
            raiseThePrice: 'resources/components/raiseThePrice.shtml',
            raiseThePriceData: 'raiseThePriceData.json',
            saveRaiseThePriceData: 'saveRaiseThePriceData.json',
        },
    }
}();

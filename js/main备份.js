var app=angular.module("appModule",['ngRoute']);
app.config(['$routeProvider', function($routeProvider){
    $routeProvider
        .when('/', {
            templateUrl:'tmpl/index.html',
            controller:"indexCtrl"
        }).when('/person',{
            templateUrl:'tmpl/person.html',
            controller:"personCtrl"
        }).when('/sym',{
            templateUrl:'tmpl/4.html',
            controller:"selectCtrl"
        }).when('/question',{
        templateUrl:'tmpl/5.html',
        controller:"questionCtrl"
    }).when('/question2',{
        templateUrl:'tmpl/5.1.html',
        controller:"questionCtrl"
    }).when('/question3',{
        templateUrl:'tmpl/5.5.html',
        controller:"questionCtrl"
    }).when('/question4',{
        templateUrl:'tmpl/5.6.html',
        controller:"questionCtrl"
    })
        .when('/con',{
            templateUrl:'tmpl/6.html',
            controller:"conCtrl"
        })
        .otherwise('/');
}]);
app.controller("myCtrl",function ($rootScope,$http) {
    //获取token值；
    $rootScope.symData="";
    $rootScope.url='http://api.huimeicare.com/oauth2/oauth/get_token?client_id=fde7146d3e6b4c15b8e3f9627749e6f7&client_secret=d552b9bc2d0d43c19445c45af5c67f27';
    //解析url
    $rootScope.getSk= function () {
        var url = $rootScope.url;
        var thisParam = new Object();
        // 判断是否存在请求的参数
        if (url.indexOf("?") != -1) {
            var str = url.substr(1);
            // 截取所有请求的参数，以数组方式保存
            strs = str.split("&");
            for(var i = 0; i < strs.length; i ++) {
                // 获取该参数名称，值。其中值以unescape()方法解码，有些参数会加密
                thisParam[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]);
            }
        }
        // 返回改参数列表对象
        return thisParam;
    }
    $rootScope.obj=$rootScope.getSk();
    $rootScope.sk=$rootScope.obj.client_secret;
    //获取token
    $http({
        method: 'POST',
        dataType:'json',
        url: $rootScope.url
    }).then(function (response) {
        $rootScope.access_token=response.data.access_token;
       /* localStorage.setItem('access_token', JSON.stringify(access_token));*/


    })
})
app.controller("indexCtrl",function ($scope,$http,$rootScope) {
    $scope.accessCode="";
    $scope.flag=true;
    $scope.birth="";
    $scope.login=function () {
        $scope.accessC=$.md5($scope.accessCode+$rootScope.sk);
        $scope.logData={"accessCode":$scope.accessCode,"key":$scope.accessC,"msgId":"1001"}
        console.log($scope.access_token)
        ajax({
            url: 'http://api.huimeicare.com/amc/v1/service.do?access_Token='+$scope.access_token,
            type: 'post',
            dataType: 'json',
            async: true,
            cache: true,
            success: function (data) {
                if(data.code==200){
                    $scope.flag=false;
                    $scope.symData=data;
                    localStorage.setItem('symData', JSON.stringify($scope.symData));
                    $scope.accessId=$scope.symData.accessId
                    console.log(console.log(localStorage.getItem('symData')))
                    window.location.hash="#!/person";

                }else {
                    $scope.message=data.message;
                    $scope.$apply(function () {
                        $scope.message =data.message;
                    });
                    $scope.flag=true;
                }
            },
            data:$scope.logData
        })


    }
   /* console.log($rootScope.symData)*/

})
app.controller("personCtrl",function ($scope,$rootScope) {
     $scope.symData=JSON.parse(localStorage.getItem('symData'))

    $scope.symptomId=$scope.symData.symptomId;
    console.log($scope.symData)

    $scope.accessId=$scope.symData.accessId;
    $scope.whos=[{id:"1","name":"本人"},{id:"2","name":"其他人"}];
    $scope.sexes=[{id:"89","name":"女"},{id:"88","name":"男"}];
    $scope.myOption="";
    $scope.mySex="";
    $scope.birth='';
    $scope.outInfor=function () {
        $scope.date= function () {
            var date = $scope.birth;
            var seperator1 = "-";
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var strDate = date.getDate();
            if (month >= 1 && month <= 9) {
                month = "0" + month;
            }
            if (strDate >= 0 && strDate <= 9) {
                strDate = "0" + strDate;
            }
            var currentdate = year + seperator1 + month + seperator1 + strDate;
            return currentdate;
        }
        $scope.myBirth=$scope.date()
        $scope.who=$scope.myOption.id;
        $scope.sex=$scope.mySex.id;
        $scope.data={"msgId":"1002","nurse":"1","accessId":$scope.accessId,"birth":$scope.myBirth,"who":$scope.who,"sex":$scope.sex};
        localStorage.setItem('myselfData', JSON.stringify($scope.data));
        console.log($scope.data)
       /* window.location.href="4.html"*/
        if($scope.myBirth && $scope.who && $scope.sex) {
            window.location.hash="#!/sym";
        }

    }

})
app.controller("selectCtrl",function ($scope,$rootScope) {
    $scope.selfData=JSON.parse(localStorage.getItem('myselfData'));
    $scope.symData=JSON.parse(localStorage.getItem('symData'))

    $scope.accessId=$scope.symData.accessId;

    $scope.symList=$scope.symData.symptomList;
    $scope.getQuestion=function ($event,value) {
        $event.stopPropagation();

        $scope.symptomId=$($event.target).data('id');

        $scope.key=$.md5($scope.accessId+$scope.symptomId+$rootScope.sk);
        $scope.selfData.symptomId=$scope.symptomId;
        $scope.selfData.key=$scope.key;
        $scope.selfData.accessId=$scope.accessId;
        localStorage.setItem('symptomId', $scope.symptomId);
        localStorage.setItem('accessId', $scope.accessId);
        console.log(typeof $scope.selfData.accessId)
        console.log( $scope.selfData)
        ajax({
          url: 'http://api.huimeicare.com/amc/v1/service.do?access_Token='+$rootScope.access_token,
          type: 'post',
          dataType: 'json',
          async: true,
          cache: true,
          data:$scope.selfData,
          success: function (data) {
              if(data.code==200){

                  $scope.queData=data;
                  localStorage.setItem('queData', JSON.stringify($scope.queData));
                /*  $scope.b=$scope.queData.abbr+"1"*/
                 /* localStorage.setItem('queDataA', $scope.b);*/
                  console.log($scope.queData)
                  if($scope.queData.questionEndFlag==100){
                      window.location.hash="#!/question";
                  }else if($scope.queData.questionEndFlag==101){

                  }else if($scope.queData.questionEndFlag==102){

                  }

              }else {

              }
          },

      })
    }
})
app.controller("questionCtrl",function ($scope,$rootScope,$http){
    $scope.queData=JSON.parse(localStorage.getItem('queData'))
    $scope.abbr=$scope.queData.abbr;
    $scope.questions=$scope.queData.questions;
    setTimeout(function () {
        $scope.$apply(function () {
            $scope.questions =$scope.questions;

        });
    }, 0);

    $scope.symptomId=localStorage.getItem('symptomId');
    $scope.accessId=localStorage.getItem('accessId');
    $scope.key=$.md5($scope.accessId+$scope.abbr+$rootScope.sk);
    console.log($scope.queData)
    console.log($(".question"))
    /* $scope.getData=function () {
       $scope.data=[];
       angular.forEach($scope.questions,function (question,key) {
           $scope.answerId=[];

           setTimeout(function () {
               $scope.$apply(function () {
                   $scope.questions =$scope.questions;
                   $scope.on=function ($event,value) {
                       setTimeout(function () {
                           var $input=$($event.target).prev("input[type=checkbox]");
                           var $inputR=$($event.target).prev("input[type=radio]");

                           if($input.is(':checked')){
                               if($scope.answerId[0]=="-1"){
                                   $scope.answerId=[];
                               }

                               $scope.answerId.push($($event.target).data("id"))
                               console.log($scope.answerId)
                           }else {
                               $scope.answerId.pop($($event.target).data("id"))
                               console.log($scope.answerId)

                           }
                           if($inputR.is(':checked')){
                               $scope.answerId=[$($event.target).data("id")]
                           }
                           $scope.obj={"questionId":question.questionId,"questionType":question.questionType,"answerId":$scope.answerId.join(',')}

                           console.log($scope.obj)
                           return $scope.obj
                       },100)

                   }
               });
           }, 0);
           console.log($scope.obj)


       })
   }*/

   /* $scope.questions=$scope.queData.questions;
    setTimeout(function () {
        $scope.$apply(function () {
            $scope.questions =$scope.questions;
            function on() {

            }
           /!* $scope.on=function ($event,value) {
                setTimeout(function () {
                    var $input=$($event.target).prev("input[type=checkbox]");
                    var $inputR=$($event.target).prev("input[type=radio]");

                    if($input.is(':checked')){
                        if($scope.answerId[0]=="-1"){
                            $scope.answerId=[];
                        }

                        $scope.answerId.push($($event.target).data("id"))
                        console.log($scope.answerId)
                    }else {
                        $scope.answerId.pop($($event.target).data("id"))
                        console.log($scope.answerId)

                    }
                    if($inputR.is(':checked')){
                        $scope.answerId=[$($event.target).data("id")]
                    }
                    console.log($scope.answerId)
                   return $scope.answerId


                },100)
                console.log($scope.answerId)

            }*!/
        });
    }, 0);*/
        $scope.getData=function () {
            $scope.data=[];
            $scope.answerId=[];
            angular.forEach($scope.questions,function (question,key) {
                var $label=$('label.on');
                angular.forEach($label,function (index,key) {
                    $scope.answerId.push($(index).data('id'))
                    console.log($scope.answerId)
                })
                $scope.obj={"questionId":question.questionId,"questionType":question.questionType,"answerId":$scope.answerId.join(',')}
                $scope.data.push($scope.obj);

                /*setTimeout(function () {
                    $scope.$apply(function () {
                        $scope.questions =$scope.questions;
                        $scope.on=function ($event,value) {
                            setTimeout(function () {
                                var $input=$($event.target).prev("input[type=checkbox]");
                                var $inputR=$($event.target).prev("input[type=radio]");

                                if($input.is(':checked')){
                                    if($scope.answerId[0]=="-1"){
                                        $scope.answerId=[];
                                    }

                                    $scope.answerId.push($($event.target).data("id"))

                                }else {
                                    $scope.answerId.pop($($event.target).data("id"))


                                }
                                if($inputR.is(':checked')){
                                    $scope.answerId=[$($event.target).data("id")]
                                }
                                $scope.obj={"questionId":question.questionId,"questionType":question.questionType,"answerId":$scope.answerId.join(',')}
                                localStorage.setItem('obj', JSON.stringify($scope.obj));
                                console.log($scope.obj)

                            },100)

                        }
                    });
                }, 0);*/



            })
        }


    $scope.questionId=$(".question").data("id");
    $scope.questionType=$(".question").data("type");
    $scope.getNext=function () {
        $scope.getData();
        console.log($scope.data)
        $scope.ansData={
            "msgId":"1003",
            "accessId":$scope.accessId,
            "symptomId":$scope.symptomId,
            "abbr":$scope.abbr,
            "key":$scope.key,
            "questions":$scope.data
        }
        console.log($scope.ansData)
        ajax({
            url: 'http://api.huimeicare.com/amc/v1/service.do?access_Token='+$rootScope.access_token,
            type: 'post',
            dataType: 'json',
            async: true,
            cache: true,
            data:$scope.ansData,
            success:function (data) {
                if(data.code=200){
                    if(data.questionEndFlag==100){
                        $scope.queData=data;
                        window.location.hash="#!/question";
                        $scope.queData=data;
                        $scope.questions=$scope.queData.questions;
                        setTimeout(function () {
                            $scope.$apply(function () {
                                $scope.questions =$scope.questions;

                            });
                        }, 0);
                    }else if(data.questionEndFlag==101){
                        $scope.visitEntitys=data.visitEntitys;
                        localStorage.setItem("visiData",JSON.stringify($scope.visitEntitys))
                        window.location.hash="#!/con";

                    }else if(data.questionEndFlag==102){

                    }




                    console.log( $scope.queData)
                }

                console.log(data)
            }
        })
    }
    $scope.goBack=function () {
        $scope.getData();
        console.log($scope.data)
        $scope.ansData={
            "msgId":"1003",
            "accessId":$scope.accessId,
            "symptomId":$scope.symptomId,
            "abbr":$scope.abbr,
            "key":$scope.key,
            "goBack":-1,
            "questions":$scope.data
        }
        console.log($scope.ansData)
        ajax({
            url: 'http://api.huimeicare.com/amc/v1/service.do?access_Token='+$rootScope.access_token,
            type: 'post',
            dataType: 'json',
            async: true,
            cache: true,
            data:$scope.ansData,
            success:function (data) {
                if(data.code=200){
                    if(data.questionEndFlag==100){
                        $scope.queData=data;
                        window.location.hash="#!/question";
                        $scope.queData=data;
                        $scope.questions=$scope.queData.questions;
                        setTimeout(function () {
                            $scope.$apply(function () {
                                $scope.questions =$scope.questions;

                            });
                        }, 0);
                    }else if(data.questionEndFlag==101){
                        $scope.visitEntitys=data.visitEntitys;
                        localStorage.setItem("visiData",JSON.stringify($scope.visitEntitys))
                        window.location.hash="#!/con";

                    }else if(data.questionEndFlag==102){

                    }




                    console.log( $scope.queData)
                }

                console.log(data)
            }
        })
    }

})
app.controller("conCtrl",function ($scope) {
    $scope.visitEntitys=JSON.parse(localStorage.getItem('visiData'))
    console.log( $scope.visitEntitys)
    angular.forEach($scope.visitEntitys,function (item) {
        console.log(item.conclusions)


    })
})
/*$state.params*/

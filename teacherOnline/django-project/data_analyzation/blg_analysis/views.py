from django.shortcuts import render
from django.http import HttpResponse
from blg_analysis import cfg

import struct
import socket
import json
from blg_analysis.qqwry import MQQWry

# Create your views here.

provinces = ['辽宁', '吉林', '黑龙江', '河北', '山西', '陕西', '甘肃', '青海', '山东', '安徽', '江苏', '浙江', '河南', '湖北', '湖南', '江西', '台湾',
             '福建', '云南', '海南', '四川', '贵州', '广东', '内蒙古', '新疆', '广西', '西藏', '宁夏', '北京', '上海', '天津', '重庆', '香港', '澳门']


def ip_ntoa(n):
    return socket.inet_ntoa(struct.pack(">L", n))


def getOriPlateData():
    conn = cfg.get_conn()
    cursor = conn.cursor()
    sql = '''
      select reg_ip
      from user_ext
      '''
    v = {}
    v['blg_data'] = []
    k = {}
    q = MQQWry()
    try:
        cursor.execute(sql)
        data = cursor.fetchall()
        print('-----------拿到所有加密ip---------')
        for item in data:
            v['blg_data'].append(q[ip_ntoa(item[0])][2])
        print('-----------ip解密,分析完毕--------')
        for item in v['blg_data']:
            pick = False
            for item2 in k:
                if item2 == item:
                    k[item2] += 1
                    pick = True
                    break
            if pick == False:
                k[item] = 1
    except Exception as err:
        print(err)
        raise err
    return k


def getSummaryPlateData(oriData):
    filterData = []
    for item in provinces:
        filterData.append({'name': item, 'value': 0})
    for key, v in oriData.items():
        for item in filterData:
            if key.find(item['name']) != -1:
                item['value'] += v
    return filterData


def get_client_ip(request):
    try:
        real_ip = request.META['HTTP_X_FORWARDED_FOR']
        regip = real_ip.split(",")[0]
    except:
        try:
            regip = request.META['REMOTE_ADDR']
        except:
            regip = ""
    return regip


def home(request):
    oriData = getOriPlateData()
    filterData = getSummaryPlateData(oriData)
    for item in filterData:
        oriData[item['name']+'地区汇总'] = item['value']
    s = {'k': sorted(oriData.items())}
    return render(request, 'blg_analysis.html', s)


def echarts(request):
    return render(request, 'echarts.html')


def echartsGetData(request):
    print('---------正在访问 eachartsGetData 的是:', get_client_ip(request), '--------------')
    oriData = getOriPlateData()
    filterData = getSummaryPlateData(oriData)
    sum = 0
    for item in filterData:
        sum += item['value']
    print('------------刨除非中国地区用户，还有人数：', sum, '--------------------')
    return HttpResponse(json.dumps(filterData), content_type='application/json')

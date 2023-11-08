// directive/foucs/index.js

import { get as getDictDetail } from '@/api/system/dictDetail'
// FFFocus指令名称
export default async function Dict(dictArr: Array<string>, completeCallback?:any) {
  let dict: any = {
    dict: {},
    label: {}
  }
  const ps: Array<any> = []
  dictArr.map((item: any) => {
    dict.dict[item] = {}
    dict.label[item] = {}
    dict[item] = []
    ps.push(
      getDictDetail(item).then((res: any) => {
        if (res.success) {
          dict[item].splice(0, 0, ...res.data)
          res.data.forEach((d: any) => {
            dict.dict[item][d.value] = d
            dict.label[item][d.value] = d.code
          })
        }
      })
    )
  })
  await Promise.all(ps)
  completeCallback(dict)
}

<script setup lang="ts">
// import csv from 'csvtojson'
import { CSVToArray } from './utils'

interface SalaryData {
  [k: string]: string | undefined
  時間戳記?: string
  公司名稱: string
  面試年份: string
  職務: string
  '月薪(K)': string
  '一年保多少(月)': string
  '學歷(可分享可不分)': string
  '面試分享or 推薦事項'?: string
  recommend?: string
  產業類別: string
}

const { data } = await useFetch('https://docs.google.com/spreadsheets/d/1hjvg6Rcy2aI90jT11yuI3MYD6DVow0CuJLuqtz4-IeU/export?format=csv')

const rowData = ref<any>(CSVToArray(data.value as string, ','))
const errors = ref<string[]>([])
const alertVisible = ref(false)
const alertType = ref('primary')
const alertMsg = ref('')
const isDialogShown = ref(false)
const reportDescription = ref('')

const company = reactive<string[]>([])
const industry = reactive<string[]>([])
const filter = reactive<Record<string, string>>({
  industry: '',
  salary: '',
  company: '',
  year: '',
})
const salaryOptions = reactive([
  '30 以下',
  '31 ~ 40',
  '41 ~ 60',
  '61 ~ 80',
  '81 ~ 100',
  '101 ~ 120',
  '121 ~ 140',
  '140 以上',
])
const yearOptions = reactive<string[]>([])
const tableData = reactive<SalaryData[]>([])
try {
  const header = ['時間戳記', '公司名稱', '面試年份', '職務', '月薪(K)', '一年保多少(月)', '學歷(可分享可不分)', '面試分享or 推薦事項', '產業類別']
  for (let i = 1; i < rowData.value.length; i++) {
    const obj: Record<string, string> = {}
    for (let j = 0; j < header.length; j++) {
      const key = header[j]
      const row = rowData.value[i]
      obj[key] = row[j]

      if (key === '月薪(K)') {
        obj[key] = obj[key]?.replace(/[>]/g, '').replace(/x/i, Math.floor(Math.random() * 9).toString())
        obj[key] = (Number(obj[key]) < 10 ? Number(obj[key]) * 10 : obj[key]).toString()
      }
      if (key === '面試年份') {
        obj[key] = obj[key]?.split('/')[0]
        if (obj[key]?.length === 3) obj[key] = (Number(obj[key]) + 1911).toString()

        if (yearOptions.indexOf(obj[key]) === -1) {
          yearOptions.push(obj[key])
        }
      }

      if (key === '面試分享or 推薦事項') {
        obj.recommend = obj[key]
        delete obj[key]
      }
     
      delete obj['面試分享or 推薦事項']
      delete obj['時間戳記']

      if (j === 1 && row[j] && !row[j].includes('(0)') && company.indexOf(row[j]) === -1) {
        company.push(row[j])
      }
      if (j === 8 && row[j] && industry.indexOf(row[j]) === -1) {
        industry.push(row[j])
      }
    }
    tableData.push(obj as SalaryData)
  }

  // const jsonObj = (await csv().fromString(data.value as string)) as SalaryData[]
  // jsonObj.forEach((el) => {
  //   if (el.公司名稱 === '' || !/\d/.test(el['月薪(K)'])) return
  //   if (company.indexOf(el.公司名稱) === -1 && !el.公司名稱.includes('(0)')) {
  //     company.push(el.公司名稱)
  //   }
  //   if (industry.indexOf(el.產業類別) === -1 && el.產業類別) {
  //     industry.push(el.產業類別)
  //   }
  //   el['月薪(K)'] = el['月薪(K)'].replace(/[>]/g, '').replace(/x/i, Math.floor(Math.random() * 9).toString())
  //   el['月薪(K)'] = (Number(el['月薪(K)']) < 10 ? Number(el['月薪(K)']) * 10 : el['月薪(K)']).toString()
  //   el.面試年份 = el.面試年份.split('/')[0]
  //   if (el.面試年份.length === 3) el.面試年份 = (Number(el.面試年份) + 1911).toString()
  //   if (yearOptions.indexOf(el.面試年份) === -1) {
  //     yearOptions.push(el.面試年份)
  //   } 
  //   el.recommend = el['面試分享or 推薦事項']
  //   delete el['面試分享or 推薦事項']
  //   delete el['時間戳記']
  //   tableData.push(el)
  // })
  yearOptions.sort((a, b) => Number(b) - Number(a))
} catch (e: any) {
  errors.value.push(`load data error: ${e.message}`)
  console.log('oops', e)
}

const displayData = computed(() => {
  try {
  return tableData
    .filter((el) => !filter.industry || el.產業類別 === filter.industry)
    .filter((el) => {
      const salary = Number(el['月薪(K)'].match(/([0-9]+)/)?.[0] || '')
      switch (filter.salary) {
        case '30 以下':
          return salary < 30
        case '31 ~ 40':
          return salary > 30 && salary <= 40
        case '41 ~ 60':
          return salary > 40 && salary <= 60
        case '61 ~ 80':
          return salary > 60 && salary <= 80
        case '81 ~ 100':
          return salary > 80 && salary <= 100
        case '101 ~ 120':
          return salary > 100 && salary <= 120
        case '121 ~ 140':
          return salary > 120 && salary <= 140
        case '140 以上':
          return salary > 140
        default: 
          return true
      }
    })
    .filter((el) => !filter.company || el.公司名稱 === filter.company)
    .filter((el) => !filter.year || el.面試年份 === filter.year)
  } catch (e: any) {
    errors.value.push(`display data error: ${e.message}`)
    console.log('oops', e)
    return []
  }
})
const reset = () => {
  try {
    useTrackEvent('reset')
    Object.keys(filter).forEach((key) => filter[key] = '')
  } catch (e: any) {
  errors.value.push(`reset error: ${e.message}`)
    console.log('oops', e)
  }
}
Object.keys(filter).forEach((key) => {
  watch(() => filter[key], (newValue, oldValue) => {
    if (newValue !== oldValue) {
      useTrackEvent('filter', {
        type: key,
        option: newValue,
      })
    }
  })
})

async function sleep(time: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, time)
  })
}

async function showAlert(msg: string, type: string) {
  alertVisible.value = true
  alertType.value = type
  alertMsg.value = msg
  await sleep(2000)
  alertVisible.value = false
}
async function bugReport(msg: string) {
  await $fetch('/api/report', {
    method: 'POST',
    body: {
      errors: msg
    }
  })

  await showAlert('回報成功！', 'success')
}
async function bugCheck() {
  try {
    await showAlert('檢測錯誤中...', 'primary')

    if (!errors.value.length) {
      isDialogShown.value = true
      return
    } else {
      await showAlert('檢測到錯誤，自動回報中...', 'danger')
    }

    await bugReport(errors.value.join('\n'))
  } finally {
    alertVisible.value = false
  }
}
async function handleClickDialogReport() {
  await showAlert('回報中...', 'primary')
  bugReport(reportDescription.value)
  isDialogShown.value = false
}
</script>
<template>
  <main p="4" mb="8">
    <h1 text="2xl" font="bold" lh="12">
      科技業 剛畢業新鮮人起薪 分享
      <a class="text-base text-primary underline" href="https://www.dcard.tw/f/tech_job/p/241943049" target="_blank">Dcard</a>
    </h1>
    <div mb="2" flex="~ wrap" gap="5" items="center">
      <div w="[calc(50%-1.25rem)] lg:1/6" relative>
        <ASelect v-model="filter.industry" :options="industry" placeholder="產業類別" />
      </div>
      <div w="[calc(50%-1.25rem)] lg:1/6" relative>
        <ASelect v-model="filter.salary" :options="salaryOptions" placeholder="薪資範圍" />
      </div>
      <div w="[calc(50%-1.25rem)] lg:1/6" relative>
        <ASelect v-model="filter.company" :options="company" placeholder="公司" />
      </div>
      <div w="[calc(50%-1.25rem)] lg:1/6" relative>
        <ASelect v-model="filter.year" :options="yearOptions" placeholder="面試年份" />
      </div>

      <ABtn @click="reset">重置</ABtn>
    </div>
    <ADataTable :rows="displayData" search multiSort :page-size="30" no-data-text="沒有資料">
      <template #header-recommend>
        面試分享or 推薦事項
      </template>
      <template #col-recommend="{ row }">
        <div w="200px" overflow="hidden"><div  break="all" ws="normal">{{ row.recommend }}</div></div>
      </template>
    </ADataTable>
  </main>
  <footer pos="fixed bottom-0 inset-x-0" flex items="center" justify="center" text="center" bg="white" p="y-2">
    <div ml="auto">
      <span>資料來源：</span>
      <a class="text-primary underline" href="https://docs.google.com/spreadsheets/d/1hjvg6Rcy2aI90jT11yuI3MYD6DVow0CuJLuqtz4-IeU/edit" target="_blank">畢業薪資分享 (回覆)</a>
    </div>
    <ABtn color="danger" icon-only icon="i-bx-error-circle" variant="text" ml="auto" @click="bugCheck">
      <ATooltip text="Bug report" />
    </ABtn>
    <ADialog
      v-model="isDialogShown"
      title="沒有檢測到問題，確定要回報嗎？"
      class="w-[400px]"
      persistent
    >
      <div class="a-card-body">
        <div mb="4">
          <ATextarea v-model="reportDescription" label="問題描述" placeholder="請簡述你遇到的問題與操作步驟" />
        </div>
        <div flex gap="x-2" justify="end">
          <ABtn color="primary" variant="outline" text="sm" @click="isDialogShown = false">取消</ABtn>
          <ABtn color="danger" text="sm" @click="handleClickDialogReport">回報</ABtn>
        </div>
      </div>
    </ADialog>
  </footer>
  <div pos="fixed" right="2" top="2">
    <AAlert v-show="alertVisible" :color="alertType">
      {{  alertMsg }}
    </AAlert>
  </div>
</template>
<style lang="postcss">
.a-list.grid.a-select-options-list {
  max-height: 200px;
  overflow-y: scroll;
}
</style>

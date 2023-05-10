<script setup lang="ts">
import csv from 'csvtojson'

interface SalaryData {
  [k: string]: string | undefined
  時間戳記?: string
  公司: string
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
const sortBy = reactive({
  name: '',
  by: '',
})
const tableData = reactive<SalaryData[]>([])
try {
  const jsonObj = (await csv().fromString(data.value as string)) as SalaryData[]
  jsonObj.forEach((el) => {
    if (el.公司 === '' || !/\d/.test(el['月薪(K)'])) return
    if (company.indexOf(el.公司) === -1 && !el.公司.includes('(0)')) {
      company.push(el.公司)
    }
    if (industry.indexOf(el.產業類別) === -1 && el.產業類別) {
      industry.push(el.產業類別)
    }
    el['月薪(K)'] = el['月薪(K)'].replace(/[>]/g, '').replace(/x/i, Math.floor(Math.random() * 9).toString())
    el['月薪(K)'] = (Number(el['月薪(K)']) < 10 ? Number(el['月薪(K)']) * 10 : el['月薪(K)']).toString()
    el.面試年份 = el.面試年份.split('/')[0]
    if (el.面試年份.length === 3) el.面試年份 = (Number(el.面試年份) + 1911).toString()

    if (yearOptions.indexOf(el.面試年份) === -1) {
      yearOptions.push(el.面試年份)
    }
    el.recommend = el['面試分享or 推薦事項']
    delete el['面試分享or 推薦事項']
    delete el['時間戳記']
    tableData.push(el)
  })
  yearOptions.sort((a, b) => Number(b) - Number(a))
} catch (e) {
  console.log('oops', e)
}

const displayData = computed(() => {
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
    .filter((el) => !filter.company || el.公司 === filter.company)
    .filter((el) => !filter.year || el.面試年份 === filter.year)
})
const reset = () => {
  useTrackEvent('reset')
  Object.keys(filter).forEach((key) => filter[key] = '')
}

watch(filter, (newValue, oldValue) => {
  Object.keys(newValue).forEach((key) => {
    if (newValue[key] !== oldValue[key]) {
      useTrackEvent(key, {
        option: newValue[key],
      })
    }
  })
})
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
  <footer pos="fixed bottom-0 inset-x-0" text="center" bg="white" p="y-2">
    <span>資料來源：</span>
    <a class="text-primary underline" href="https://docs.google.com/spreadsheets/d/1hjvg6Rcy2aI90jT11yuI3MYD6DVow0CuJLuqtz4-IeU/edit" target="_blank">畢業薪資分享 (回覆)</a>
  </footer>
</template>
<style lang="postcss">
.a-list.grid.a-select-options-list {
  max-height: 200px;
  overflow-y: scroll;
}
</style>

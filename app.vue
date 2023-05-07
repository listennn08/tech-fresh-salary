<script setup lang="ts">
import csv from 'csvtojson'

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
const company = reactive<string[]>([])
const industry = reactive<string[]>([''])
const filterIndustry = ref('')
const tableData = reactive<SalaryData[]>([])
try {
  const jsonObj = (await csv().fromString(data.value as string)) as SalaryData[]
  jsonObj.forEach((el) => {
    if (/\(0\.?\)/.test(el.公司名稱) || el.公司名稱 === '') return
    if (company.indexOf(el.公司名稱) === -1) {
      company.push(el.公司名稱)
    }
    if (industry.indexOf(el.產業類別) === -1 && el.產業類別) {
      industry.push(el.產業類別)
    }
    el.recommend = el['面試分享or 推薦事項']
    delete el['面試分享or 推薦事項']
    delete el['時間戳記']
    tableData.push(el)
  })
} catch (e) {
  console.log('oops', e)
}

const displayData = computed(() => {
    return tableData
      .filter((el) => !filterIndustry.value || el.產業類別 === filterIndustry.value)
  })
</script>
<template>
  <main p="4" mb="8">
    <h1 text="2xl" font="bold" lh="12">
      科技業 剛畢業新鮮人起薪 分享
      <a class="text-base text-primary underline" href="https://www.dcard.tw/f/tech_job/p/241943049" target="_blank">Dcard</a>
    </h1>
    <div w="1/6" mb="2">
      <ASelect v-model="filterIndustry" :options="industry" placeholder="產業類別" />
    </div>
    <ADataTable :rows="displayData" search multiSort :page-size="30">
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
---
lang: zh-CN
title: Amplitude 漏斗分析手册
slug: amplitude-funnel-playbook
section: reports
section_title: 数据报告
section_description: 用于跟踪内容漏斗表现的分析指南。
summary: 记录如何在 Amplitude 中构建并维护内容转化漏斗，以及团队的例行复盘节奏。
updated: 2025-10-13
tags:
  - analytics
  - funnel
  - amplitude
---

﻿# Amplitude Funnel Playbook

## Goal
Track how each resource category contributes to conversions so the content team can double down on the formats that lead to demo requests or email sign-ups.

## Instrumentation Summary
The site now emits the following structured events (via Google Analytics and Amplitude):

| Event | Trigger | Key Properties |
| --- | --- | --- |
| `content_detail_click` | A visitor clicks into any resource card on `/pages/resources/index.html` | `content_category`, `content_category_name`, `content_type`, `slug`, `title`, `tag`, `position`, `source`, `stage` (defaults to `discover`) |
| `content_cta_click` | Click on hero CTA buttons, footer CTAs, or “view all” links on the resources hub | `category` (`hero`, `footer`, or section id), `content_category`, `ctaId`, `stage`, `source` |
| `content_subscribe_submit` | Visitor submits the resources email form | `content_category`, `source`, `stage`, `email_domain`, `ctaId`, `form_id`, `funnel_step` |
| `resources_subscribe_success` / `resources_subscribe_error` | CRM webhook succeeds or fails when subscribing via the resources form | `crm_status`, `error_message` (optional), `email_domain`, `form_id`, `source` |
| `resources_subscribe_automation_success` / `resources_subscribe_automation_error` | Email automation provider returns success/failure for resources form | `automation_status`, `error_message` (optional), `email_domain`, `form_id`, `source` |
| `plan_submit` | Homepage “领取定制计划”表单提交 | `name`, `email`, `goal`, `time`, `form_id`, `funnel_step`, `source` |
| `plan_submit_success` / `plan_submit_error` | CRM webhook成功或失败后回调 | `crm_status`, `goal`, `error_message` (optional), `form_id`, `source` |
| `plan_automation_success` / `plan_automation_error` | Email automation事件投递结果 | `automation_status`, `error_message` (optional), `form_id`, `source`, `goal` |
| `content_conversion` | Fired together with GA `conversion` event when a CTA is considered a conversion (currently the resources subscribe form) | Inherits properties from `trackConversion`, including `conversion_type`, `content_stage`, `source`, `email_domain`, `cta_id`, `crm_status` |
| `scroll_depth` | 用户滚动超过 25/50/75/90/100% | `percentage`, `path` |
| `video_play` / `video_progress` / `video_complete` | 页面内 `<video>` 元素播放、达到 25/50/75/95% 和播放完毕 | `video_id`, `video_title`, `percentage`, `duration`, `current_time`, `path` |

> All events include the helper property `event_source = web` and inherit the optional ingestion metadata defined in `assets/js/analytics-config.js`.

## Configuration Steps
1. **Amplitude API Key**: open `assets/js/analytics-config.js` and populate `amplitudeApiKey` with the project’s API key. Deploy the change so the browser SDK can initialize.
2. **Verify Tracking**: load the resources hub with `?analytics_debug=1` to确认 `scroll_depth`、`video_*`、`resources_subscribe`、`plan_submit` 等事件被送入 `dataLayer` 与 Amplitude Live View。
3. **CRM Endpoints**: 在 `assets/js/config.js` 中配置 `subscribeEndpoint` 与 `planEndpoint` 指向 CRM Webhook，前端会在成功/失败时推送 `*_success`、`*_error` 事件。
4. **Email Automation**: 为 `SITE_CONFIG.emailAutomation` 填写 `endpoint`、`listId`、`apiKey` 等信息，使 `window.emailAutomation.subscribe/emitEvent` 能把资源订阅与计划表单写入营销自动化平台。
5. **Default Tracking**: the SDK automatically records sessions and page views. Update `amplitudeOptions.defaultTracking` if you want to include file downloads or remove form tracking.

## Building the Funnel in Amplitude
1. Create a new Funnel chart.
2. Add the steps:
    - **Step 1** `content_detail_click` (filter `source = resources-index`).
    - **Step 2** `content_cta_click` (filter `stage = consideration`).
    - **Step 3** `plan_submit` 或 `content_subscribe_submit`（根据希望追踪的转化类型，可拆成两个漏斗）。为确保成功率分析，再补充一个虚拟步骤 `plan_submit_success` / `resources_subscribe_success`，并在“Completion”里比较 `crm_status = success` 的完成率。
3. Use the “Breakdown” panel to split the funnel by `content_category_name` or `content_type`，并叠加 `crm_status` 判断是否因为接口失败导致流失。
4. Save the chart to a dashboard named **“Content Conversion Funnel”**.
5. Configure a weekly recurring email from that dashboard to the content/marketing stakeholders (Amplitude → More → Send via Email). This satisfies the “定期查看” requirement.

## Dashboard Recommendations
- **内容表现看板**：包含柱状图对比 `content_cta_click` 按 `content_category_name` 的数量，以及折线图跟踪 `scroll_depth` 75% 以上的周趋势。
- **线索质量看板**：使用漏斗组件展示 `plan_submit → plan_submit_success`，再加表格统计 `goal` 字段与 `crm_status`。
- **互动行为看板**：结合 `video_play`、`video_progress`、`video_complete` 观察视频留存，辅以 `resources_subscribe_automation_success` 监控邮件自动化健康度。
- 建议在 Amplitude 中为上述看板配置 “Send via Email → Weekly” 报告，覆盖内容、市场与产品团队。

## Operating Cadence
- **Weekly**: review funnel conversion rates and click-through from Step 1 to Step 3. Annotate major content launches in the dashboard to correlate lifts.
- **Monthly**: export the chart CSV and share insights in the team retro. Prioritise the top two converting categories for new production.
- **Quarterly**: revisit the `trackConversion` call if additional conversion points (e.g., demo bookings or resource downloads) should be counted.

## Next Extensions
- Instrument resource detail pages with their own `content_cta_click` events once those pages host specific CTAs.
- Map Amplitude user IDs to CRM records by setting `setUserId` after authentication (if a login flow is introduced).
- Layer cohorts (new vs returning visitors) in the funnel breakdown to understand how loyalty impacts conversions.

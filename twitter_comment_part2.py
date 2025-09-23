#!/usr/bin/env python3
"""
继续Twitter评论任务 - 已经完成2条，需要再完成8条
"""
from playwright.sync_api import sync_playwright
import time
import json

# 评论模板
COMMENTS = [
    "Great content! For more therapeutic soundscapes, check out our free sound healing app with 213+ tracks: soundflows.app 🌙",
    "Love this! If you enjoy relaxing sounds, you might like our free sound healing platform with animated backgrounds: soundflows.app",
    "This is wonderful! For those seeking better sleep and relaxation, we offer 9 therapeutic soundscapes free at soundflows.app",
    "Amazing insights! Complement your practice with our free sound healing app featuring forest, rain, and meditation sounds: soundflows.app",
    "So helpful! For additional relaxation tools, try our free sound healing web app with 213+ therapeutic audio tracks: soundflows.app",
    "Great wellness content! For those seeking better sleep and relaxation, we offer 213+ free therapeutic soundscapes: soundflows.app 🌙",
    "Excellent insights! Our free sound healing app can help with stress relief and better sleep: soundflows.app",
    "Love sharing this! We offer 213+ free therapeutic audio tracks for meditation and relaxation: soundflows.app"
]

# 关键词列表
KEYWORDS = [
    "stress relief",
    "mindfulness",
    "relaxation",
    "anxiety relief",
    "yoga",
    "self care",
    "mental health awareness"
]

def comment_on_posts(page, keyword, max_comments=3):
    """搜索关键词并评论热门帖子"""
    print(f"\n=== 搜索关键词: {keyword} ===")

    # 导航到搜索页面
    page.goto(f"https://x.com/search?q={keyword}&src=typed_query")
    time.sleep(3)

    # 切换到"Top"标签页
    try:
        page.click('text="Top"')
        time.sleep(2)
    except:
        pass

    commented_count = 0
    commented_links = []

    # 获取前5个帖子
    posts = page.query_selector_all('article[data-testid="tweet"]')

    for i, post in enumerate(posts[:5]):
        try:
            if commented_count >= max_comments:
                break

            # 跳过自己的帖子
            author_element = post.query_selector('a[href*="/status/"]')
            if author_element and '/quanan_wei/status/' in author_element.get_attribute('href', ''):
                continue

            # 获取帖子统计数据
            stats_elements = post.query_selector_all('span[dir="ltr"]')
            likes = reposts = replies = 0

            # 查找统计数据
            for elem in stats_elements:
                text = elem.text_content().strip()
                if 'K' in text:
                    num = float(text.replace('K', ''))
                    if num > 100:  # 过滤掉过大的数字
                        continue
                    num = int(num * 1000)
                else:
                    try:
                        num = int(text.replace(',', ''))
                    except:
                        continue

                # 根据位置判断是哪种数据
                parent = elem.query_selector('..')
                if parent:
                    aria_label = parent.get_attribute('aria-label', '').lower()
                    if 'like' in aria_label:
                        likes = num
                    elif 'repost' in aria_label:
                        reposts = num
                    elif 'reply' in aria_label:
                        replies = num

            print(f"帖子 {i+1}: {likes} 点赞, {reposts} 转发, {replies} 回复")

            # 判断是否为热门帖子
            if likes > 1000 or reposts > 200 or replies > 50:
                print(f"  热门帖子，正在评论...")

                # 点击评论按钮
                reply_button = post.query_selector('button[data-testid="reply"]')
                if reply_button:
                    reply_button.click()
                    time.sleep(2)

                    # 输入评论
                    comment_textarea = page.query_selector('div[role="textbox"][data-testid="tweetTextarea"]')
                    if comment_textarea:
                        import random
                        comment = random.choice(COMMENTS)
                        comment_textarea.fill(comment)
                        time.sleep(1)

                        # 发布评论
                        post_button = post.query_selector('div[data-testid="tweetButton"]')
                        if post_button:
                            post_button.click()
                            print(f"  ✅ 评论成功: {comment}")
                            commented_count += 1

                            # 记录帖子链接
                            if author_element:
                                href = author_element.get_attribute('href')
                                if href and '/status/' in href:
                                    full_url = f"https://x.com{href}"
                                    commented_links.append(full_url)
                                    print(f"  帖子链接: {full_url}")

                            time.sleep(3)

                            # 如果评论够了就停止
                            if commented_count >= max_comments:
                                break
                    else:
                        print("  未找到评论框")

                    # 按 ESC 取消评论（如果需要）
                    page.keyboard.press('Escape')
                    time.sleep(1)
            else:
                print("  帖子不够热门，跳过")

        except Exception as e:
            print(f"  ❌ 评论失败: {e}")
            continue

    return commented_count, commented_links

def main():
    """主函数"""
    with sync_playwright() as p:
        # 启动浏览器
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()

        # 访问Twitter
        page.goto("https://x.com/home")
        time.sleep(5)

        total_commented = 0
        all_commented_links = []

        # 遍历关键词进行搜索和评论
        for keyword in KEYWORDS:
            try:
                # 每个关键词最多评论2条
                count, links = comment_on_posts(page, keyword, max_comments=2)
                total_commented += count
                all_commented_links.extend(links)

                print(f"\n关键词 '{keyword}' 完成了 {count} 条评论")

                # 如果总共评论够了就停止
                if total_commented >= 8:
                    break

                # 每个关键词之间等待
                time.sleep(3)

            except Exception as e:
                print(f"搜索 {keyword} 时出错: {e}")
                continue

        # 保存结果
        result = {
            "total_commented": total_commented,
            "commented_links": all_commented_links,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }

        with open("twitter_comments_part2.json", "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)

        print(f"\n=== 任务完成 ===")
        print(f"总共评论了 {total_commented} 条帖子")
        print(f"详细记录已保存到 twitter_comments_part2.json")

        # 保持浏览器打开10秒
        time.sleep(10)
        browser.close()

if __name__ == "__main__":
    main()
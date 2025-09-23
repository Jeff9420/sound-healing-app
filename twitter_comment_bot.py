#!/usr/bin/env python3
"""
Twitter评论机器人 - 自动搜索相关关键词并评论
"""
from playwright.sync_api import sync_playwright
import time
import json

# 关键词列表
KEYWORDS = [
    "meditation",
    "sleep",
    "wellness",
    "mental health",
    "stress relief",
    "mindfulness",
    "relaxation",
    "anxiety relief",
    "yoga",
    "self care"
]

# 评论模板
COMMENTS = [
    "Great content! For more therapeutic soundscapes, check out our free sound healing app with 213+ tracks: soundflows.app 🌙",
    "Love this! If you enjoy relaxing sounds, you might like our free sound healing platform with animated backgrounds: soundflows.app",
    "This is wonderful! For those seeking better sleep and relaxation, we offer 9 therapeutic soundscapes free at soundflows.app",
    "Amazing insights! Complement your practice with our free sound healing app featuring forest, rain, and meditation sounds: soundflows.app",
    "So helpful! For additional relaxation tools, try our free sound healing web app with 213+ therapeutic audio tracks: soundflows.app"
]

def search_and_comment(page, keyword):
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

    # 获取前3个帖子
    posts = page.query_selector_all('article[data-testid="tweet"]')
    commented_count = 0

    for i, post in enumerate(posts[:3]):
        try:
            # 跳过自己的帖子
            author_element = post.query_selector('a[href*="/status/"]')
            if author_element and '/quanan_wei/status/' in author_element.get_attribute('href'):
                continue

            # 获取帖子文本
            tweet_text_element = post.query_selector('div[data-testid="tweetText"]')
            if tweet_text_element:
                tweet_text = tweet_text_element.text_content()
                print(f"\n帖子 {i+1}: {tweet_text[:100]}...")

                # 检查是否已经评论过
                replies_button = post.query_selector('button[data-testid="reply"]')
                if replies_button:
                    replies_count = replies_button.query_selector('span')
                    if replies_count and replies_count.text_content().strip() != "0":
                        print(f"  已有评论，跳过")
                        continue

                # 点击评论按钮
                print(f"  正在评论...")
                replies_button.click()
                time.sleep(1)

                # 输入评论
                comment_textarea = page.query_selector('div[role="textbox"][data-testid="tweetTextarea"]')
                if comment_textarea:
                    import random
                    comment = random.choice(COMMENTS)
                    comment_textarea.fill(comment)
                    time.sleep(1)

                    # 发布评论
                    post_button = page.query_selector('div[data-testid="tweetButton"] span:has-text("Post")')
                    if post_button:
                        post_button.click()
                        print(f"  ✅ 评论成功: {comment}")
                        commented_count += 1
                        time.sleep(2)

                        # 记录帖子链接
                        tweet_link_element = post.query_selector('a[href*="/status/"]')
                        if tweet_link_element:
                            href = tweet_link_element.get_attribute('href')
                            if href and '/status/' in href:
                                full_url = f"https://x.com{href}"
                                print(f"  帖子链接: {full_url}")

                # 按 ESC 取消评论（如果需要）
                page.keyboard.press('Escape')
                time.sleep(1)

        except Exception as e:
            print(f"  ❌ 评论失败: {e}")
            continue

    return commented_count

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
        commented_posts = []

        # 遍历关键词进行搜索和评论
        for keyword in KEYWORDS:
            try:
                if total_commented >= 10:  # 达到10条评论后停止
                    break

                count = search_and_comment(page, keyword)
                total_commented += count

                # 记录成功评论的关键词
                if count > 0:
                    commented_posts.append({
                        "keyword": keyword,
                        "commented_count": count
                    })

                # 每个关键词之间等待
                time.sleep(3)

            except Exception as e:
                print(f"搜索 {keyword} 时出错: {e}")
                continue

        # 保存结果
        result = {
            "total_commented": total_commented,
            "commented_keywords": commented_posts,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }

        with open("twitter_comments_log.json", "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)

        print(f"\n=== 任务完成 ===")
        print(f"总共评论了 {total_commented} 条帖子")
        print(f"详细记录已保存到 twitter_comments_log.json")

        # 保持浏览器打开10秒
        time.sleep(10)
        browser.close()

if __name__ == "__main__":
    main()
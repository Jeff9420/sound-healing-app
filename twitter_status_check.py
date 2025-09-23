#!/usr/bin/env python3
"""
检查推文发布状态
"""
from playwright.sync_api import sync_playwright
import time

def check_tweet_status():
    """检查推文是否已发布"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()

        # 访问用户个人主页
        page.goto("https://x.com/quanan_wei")

        # 等待页面加载
        time.sleep(5)

        # 检查是否包含推文内容的关键词
        tweet_keywords = ["Sound Healing", "sleep", "soundflows.app"]

        # 获取页面内容
        page_content = page.content()

        # 检查是否包含关键词
        found_keywords = []
        for keyword in tweet_keywords:
            if keyword in page_content:
                found_keywords.append(keyword)

        print(f"找到的关键词: {found_keywords}")

        # 截图保存
        page.screenshot(path="tweet_status_check.png")
        print("截图已保存到 tweet_status_check.png")

        # 查找最新的推文
        tweets = page.query_selector_all('article[data-testid="tweet"]')
        print(f"找到 {len(tweets)} 条推文")

        for i, tweet in enumerate(tweets[:5]):  # 只检查前5条
            try:
                tweet_text = tweet.query_selector('div[data-testid="tweetText"]').text_content()
                print(f"推文 {i+1}: {tweet_text[:100]}...")

                # 检查是否包含我们的关键词
                if any(keyword in tweet_text for keyword in tweet_keywords):
                    print(">>> 这是我们刚发布的推文！")

                    # 获取推文链接
                    tweet_link = tweet.query_selector('a')
                    if tweet_link:
                        href = tweet_link.get_attribute('href')
                        if href and '/status/' in href:
                            full_url = f"https://x.com{href}"
                            print(f"推文链接: {full_url}")
            except Exception as e:
                print(f"读取推文 {i+1} 时出错: {e}")

        time.sleep(10)
        browser.close()

if __name__ == "__main__":
    check_tweet_status()
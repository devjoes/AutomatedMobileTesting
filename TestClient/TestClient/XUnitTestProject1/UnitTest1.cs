using System;
using System.Threading;
using OpenQA.Selenium;
using OpenQA.Selenium.Appium;
using OpenQA.Selenium.Appium.Android;
using OpenQA.Selenium.Appium.Interfaces;
using OpenQA.Selenium.Appium.Service;
using OpenQA.Selenium.Remote;
using Xunit;

namespace XUnitTestProject1
{
    public class UnitTest1 : IDisposable
    {
        private AppiumDriver<IMobileElement<AndroidElement>> driver;

        public UnitTest1()
        {
            
            var options = new AppiumOptions();
            options.PlatformName= "Android";
            options.AddAdditionalCapability("deviceName", "android");
            options.AddAdditionalCapability("platformVersion", "4.2.2");
            options.AddAdditionalCapability("app", "/apps/app.apk");
            options.AddAdditionalCapability("udid","droid7227000004_0:5555");
            options.AddAdditionalCapability("browserName","android");
            options.AddAdditionalCapability("browserVersion", "node-droid7227000004");
            this.driver = new AndroidDriver<IMobileElement<AndroidElement>>(new Uri("http://demo:demo@40.113.3.66/wd/hub"), options);
            this.driver.LaunchApp();
            Thread.Sleep(1000);
        }

        [Fact]
        public void Test1()
        {
            Assert.Empty(this.driver.FindElementsByAccessibilityId("MainActivity-TestText"));
        }
        
        [Fact]
        public void Test2()
        {
            var a = this.driver.Title;
            var btn = this.driver.FindElementById("tv_test_text");
            btn.Click();
            Assert.NotEmpty(this.driver.FindElementsById("bt_test_button"));
        }

        public void Dispose()
        {
            this.driver?.CloseApp();
            this.driver?.Dispose();
        }
    }
}

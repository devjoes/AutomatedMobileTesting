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
            options.AddAdditionalCapability("deviceName", "192.168.0.12:5555");
            options.AddAdditionalCapability("platformVersion", "4.2.2");
            options.AddAdditionalCapability("app", "/app.apk");
            this.driver = new AndroidDriver<IMobileElement<AndroidElement>>(new Uri("http://localhost:4444/wd/hub"), options);
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
            var btn = this.driver.FindElementByAccessibilityId("MainActivity-TestButton");
            btn.Click();
            Assert.NotEmpty(this.driver.FindElementsByAccessibilityId("MainActivity-TestText"));
        }

        public void Dispose()
        {
            this.driver?.CloseApp();
            this.driver?.Dispose();
        }
    }
}

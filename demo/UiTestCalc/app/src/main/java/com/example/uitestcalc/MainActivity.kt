package com.example.uitestcalc

import android.os.Bundle
import android.support.v7.app.AppCompatActivity
import android.view.View
import android.widget.Button
import com.microsoft.appcenter.AppCenter
import com.microsoft.appcenter.analytics.Analytics
import com.microsoft.appcenter.crashes.Crashes
import kotlinx.android.synthetic.main.activity_main.*


class MainActivity : AppCompatActivity() {

    private val logic: CalcLogic = CalcLogic()
    private var clearOnNumber: Boolean = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        AppCenter.start(
            application, "da478ab7-ae83-4cf5-b33d-d727e2889cb1",
            Analytics::class.java, Crashes::class.java
        )
    }

    fun onClick_Operation(btn: View) {
        if (!(btn is Button)) {
            return
        }
        val op = btn.text.get(0)
        if (clearOnNumber) {
            clearOnNumber = false
            if (op.isDigit() || op == '-') {
                txtSum.setText(op.toString())
                return
            }
        }
        var newSum = txtSum.text.toString()
        if (newSum === "0" && op != '0' && (op.isDigit() || op == '-')) {
            txtSum.setText("$op")
            return
        }
        if (op.isDigit() || op == '·') {
            newSum += op
        }; else {
            newSum += " $op "
        }

        if (logic.validate(newSum)) {
            val formatNegativeNumbers = Regex("""((^\s?)|(\d\s?\D+\s))\-\s(\d)""")
            newSum = formatNegativeNumbers.replace(newSum) { m ->
                m.groups[1]!!.value + "-" + m.groups.last()!!.value
            }
            newSum = newSum.trimStart(' ').replace("  ", " ")
            if (newSum.startsWith('0') && newSum.length > 1 && newSum.indexOf(' ') != 1) {
                newSum = newSum.trimStart('0')
            }
            if (newSum == "") {
                newSum = "0"
            }
            if (newSum.startsWith("0 - ")) {
                newSum = '-' + newSum.substring(4)
            }
            txtSum.setText(newSum)
        }
    }

    fun onClick_Clear(vw: View) {
        txtSum.setText("0")
    }

    fun onClick_Equals(vw: View) {
        if (txtSum.text.trim().matches(Regex("\\D"))) {
            return
        }
        val result = logic.calculate(txtSum.text.toString())
        if (Math.floor(result) == result) {
            txtSum.setText(result.toInt().toString())
        } else {
            txtSum.setText(result.toString())
        }

        clearOnNumber = true
    }
}

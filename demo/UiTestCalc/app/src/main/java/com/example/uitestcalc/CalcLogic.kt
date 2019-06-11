package com.example.uitestcalc

class CalcLogic {
    fun validate(sum: String): Boolean {
        val parts = sum
            .replace('·', '.')
            .trim()
            .split(Regex("\\s+"))
        if (parts.count() == 1) {
            return parts.single().toDoubleOrNull() != null
        }
        val lastIsNum = parts.last().toDoubleOrNull() != null
        val secondToLastIsNum = parts[parts.count() - 2].toDoubleOrNull() != null
        return lastIsNum != secondToLastIsNum
                || parts.last() == "-"
    }

    fun calculate(sum: String): Double {
        //TODO: This is intentionally wrong - doesnt take operator precedence in to account - this will fail a test and then will be fixed
        val parts = Regex("(^|[^\\d\\.])(\\-?[\\d\\.]+)")
            .findAll(
                ("0$sum")
                    .replace('·', '.')
                    .replace(" ", "")
            )

        return parts.fold(0.0) { acc, s ->
            val op = s.groups[1]!!.value
            val num = s.groups[2]!!.value.toDouble()
            when (op) {
                "", "+" -> acc + num
                "-" -> acc - num
                "÷" -> acc / num
                "×" -> acc * num
                else -> Double.NaN
            }
        }

    }
}
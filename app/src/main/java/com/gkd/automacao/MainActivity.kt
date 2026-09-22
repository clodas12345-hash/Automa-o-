package com.gkd.automacao

import android.os.Bundle
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        findViewById<Button>(R.id.btnActivateNfc).setOnClickListener {
            Toast.makeText(this, "Sistema Ativo!", Toast.LENGTH_SHORT).show()
        }
    }
}

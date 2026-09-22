package com.example.smartlockhce

import android.nfc.cardemulation.HostApduService
import android.os.Bundle

class MyHCEService : HostApduService() {
    companion object {
        // UID padrão configurado para ELG SHFD701
        private val UID_BYTES = byteArrayOf(0x04.toByte(), 0xA1.toByte(), 0xB2.toByte(), 0xC3.toByte())
        private val SUCCESS_SW = byteArrayOf(0x90.toByte(), 0x00.toByte())
    }

    override fun processCommandApdu(commandApdu: ByteArray, extras: Bundle?): ByteArray {
        // Se a fechadura solicitar o comando GET DATA / SELECT UID (ex: FF CA 00 00 00)
        if (commandApdu.size >= 2 && commandApdu[0] == 0xFF.toByte() && commandApdu[1] == 0xCA.toByte()) {
            val response = ByteArray(UID_BYTES.size + SUCCESS_SW.size)
            System.arraycopy(UID_BYTES, 0, response, 0, UID_BYTES.size)
            System.arraycopy(SUCCESS_SW, 0, response, UID_BYTES.size, SUCCESS_SW.size)
            return response
        }
        return SUCCESS_SW
    }

    override fun onDeactivated(reason: Int) {}
}

package com.routeshare

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat

/**
 * Foreground service que mantiene viva la app (y por tanto el watchPosition de
 * JS) mientras el conductor comparte su ubicación, incluso con la pantalla
 * apagada o la app minimizada. Muestra una notificación persistente como exige
 * Android para los servicios de ubicación en segundo plano.
 */
class LocationForegroundService : Service() {

  companion object {
    const val CHANNEL_ID = "routeshare_location"
    const val NOTIFICATION_ID = 51
  }

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    // En Android 14+ startForeground con tipo "location" puede lanzar
    // SecurityException / ForegroundServiceStartNotAllowedException segun el
    // estado de permisos o si el sistema considera que se inicio en segundo
    // plano. Esa excepcion ocurre fuera del puente JS, asi que hay que
    // capturarla aqui o la app se cierra. Si falla, detenemos el servicio sin
    // tumbar la app: el envio de ubicacion sigue funcionando en primer plano.
    try {
      createChannel()
      val notification = buildNotification()
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        startForeground(
          NOTIFICATION_ID,
          notification,
          ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION,
        )
      } else {
        startForeground(NOTIFICATION_ID, notification)
      }
    } catch (t: Throwable) {
      stopSelf()
      return START_NOT_STICKY
    }
    // Si el sistema mata el servicio, que lo reinicie (el viaje sigue activo).
    return START_STICKY
  }

  private fun buildNotification(): Notification {
    return NotificationCompat.Builder(this, CHANNEL_ID)
      .setContentTitle("RouteShare")
      .setContentText("Compartiendo tu ubicación con el pasajero")
      .setSmallIcon(android.R.drawable.ic_menu_mylocation)
      .setOngoing(true)
      .setPriority(NotificationCompat.PRIORITY_LOW)
      .build()
  }

  private fun createChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
      if (manager.getNotificationChannel(CHANNEL_ID) == null) {
        val channel = NotificationChannel(
          CHANNEL_ID,
          "Ubicación en viaje",
          NotificationManager.IMPORTANCE_LOW,
        )
        channel.description = "Mantiene activo el envío de ubicación durante el viaje"
        manager.createNotificationChannel(channel)
      }
    }
  }
}

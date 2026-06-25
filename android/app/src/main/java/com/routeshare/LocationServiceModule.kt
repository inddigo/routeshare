package com.routeshare

import android.content.Intent
import android.os.Build
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * Puente JS <-> Android para arrancar/detener el foreground service de
 * ubicación. Lo usa src/services/locationService.ts.
 */
class LocationServiceModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName() = "LocationService"

  @ReactMethod
  fun startService(promise: Promise) {
    try {
      val intent = Intent(reactContext, LocationForegroundService::class.java)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        reactContext.startForegroundService(intent)
      } else {
        reactContext.startService(intent)
      }
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("START_FAILED", e)
    }
  }

  @ReactMethod
  fun stopService(promise: Promise) {
    try {
      val intent = Intent(reactContext, LocationForegroundService::class.java)
      reactContext.stopService(intent)
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("STOP_FAILED", e)
    }
  }
}

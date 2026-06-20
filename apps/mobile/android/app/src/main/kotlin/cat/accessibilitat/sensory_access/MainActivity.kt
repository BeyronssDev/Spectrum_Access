package cat.accessibilitat.sensory_access

import android.content.pm.PackageManager
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(
            flutterEngine.dartExecutor.binaryMessenger,
            "spectrum_access/native_config"
        ).setMethodCallHandler { call, result ->
            when (call.method) {
                "hasGoogleMapsApiKey" -> result.success(hasGoogleMapsApiKey())
                else -> result.notImplemented()
            }
        }
    }

    private fun hasGoogleMapsApiKey(): Boolean {
        val flags = PackageManager.GET_META_DATA
        val appInfo = packageManager.getApplicationInfo(packageName, flags)
        val apiKey = appInfo.metaData?.getString("com.google.android.geo.API_KEY")
        return !apiKey.isNullOrBlank() && !apiKey.startsWith("\$")
    }
}

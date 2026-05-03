<?php
namespace App\Http\Controllers;
use App\Models\HeroSlide;
use Illuminate\Http\Request;

class HeroSlideController extends Controller {
    public function index() {
        return response()->json(HeroSlide::where('is_active', true)->orderBy('order_index')->get());
    }

    public function adminIndex() {
        return response()->json(HeroSlide::orderBy('order_index')->get());
    }

    public function store(Request $request) {
        $data = $request->validate([
            'image' => 'required|string',
            'label' => 'nullable|string',
            'headline' => 'required|string',
            'sub' => 'nullable|string',
            'cta' => 'nullable|string',
            'href' => 'nullable|string',
            'accent' => 'nullable|string',
            'is_active' => 'boolean',
            'order_index' => 'integer'
        ]);
        $slide = HeroSlide::create($data);
        return response()->json($slide);
    }

    public function update(Request $request, $id) {
        $slide = HeroSlide::findOrFail($id);
        $slide->update($request->all());
        return response()->json($slide);
    }

    public function destroy($id) {
        HeroSlide::findOrFail($id)->delete();
        return response()->json(['success' => true]);
    }
}

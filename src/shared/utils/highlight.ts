export function addHighlightToModel(
	model: Model,
	options?: {
		fillColor?: Color3;
		fillTransparency?: number;
		outlineColor?: Color3;
		outlineTransparency?: number;
		depthMode?: Enum.HighlightDepthMode;
	},
): Highlight {
	const {
		fillColor = new Color3(1, 1, 1),
		fillTransparency = 0.5,
		outlineColor = new Color3(1, 1, 1),
		outlineTransparency = 0.25,
		depthMode = Enum.HighlightDepthMode.Occluded,
	} = options ?? {};
	const highlight = new Instance('Highlight');
	highlight.Parent = model;

	highlight.FillColor = fillColor;
	highlight.FillTransparency = fillTransparency;
	highlight.DepthMode = depthMode;
	highlight.OutlineColor = outlineColor;
	highlight.OutlineTransparency = outlineTransparency;

	return highlight;
}
